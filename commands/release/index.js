const prompts = require('prompts')
const simpleGit = require('simple-git')
const chalk = require('chalk')
const ora = require('ora')
const { pipe, then } = require('ramda')

const reactNativeVersionUp = require('react-native-version-up')

const apps = require('./apps/apps')
const {
  getTags,
  getDiffSinceLastTag,
  checkoutMaster,
  tagAndPush
} = require('./utils')
const { tag, loadConfig } = require('../../utils')

const output = console.log // eslint-disable-line no-console

// Main fns
const releaseApp = app =>
  pipe(
    getPaths,
    then(pullRepo),
    then(getLatestTag),
    then(generateNewTag),
    then(getDiff),
    then(confirmTag),
    then(runReactNativeBump),
    then(pushNewTag),
    then(handleDepenedencies),
    then(finish)
  )({ app, apps })

const outputDiff = diff => {
  output(chalk.underline('Here are the commits that you are about to release:'))
  diff.map(({ message, author_name }) =>
    output(`+ ${chalk.green(message)} by ${author_name}`)
  )
}

const getPaths = async input => {
  const { apps } = input
  const paths = await loadConfig(apps.map(({ name }) => name))
  return {
    ...input,
    apps,
    paths
  }
}

const pullRepo = async input => {
  const { app, paths } = input
  output('\n')
  const oraPull = ora('Pulling repo and fetching tags...').start()
  const repo = simpleGit(paths[app.name])

  await checkoutMaster(repo)

  return {
    ...input,
    app,
    oraPull,
    repo
  }
}

const getLatestTag = async input => {
  if (!input) return false
  const { app, repo } = input

  const tags = await getTags(
    repo,
    app.reactNative ? { '--sort': '-v:refname' } : {}
  )

  return {
    ...input,
    tags,
    latestTag: tags.latest
  }
}

const runReactNativeBump = async input => {
  if (!input) return false
  const { paths, app, repo, tags } = input

  if (!app.reactNative) return input

  const pathToRoot = paths[app.name]
  const { info } = reactNativeVersionUp.getCurrentInfo({ pathToRoot })
  const lastNativeTag = `v${info.version}`

  const podfileDiff = await getDiffSinceLastTag(
    repo,
    lastNativeTag,
    'ios/Podfile'
  )

  const gradleDiff = await getDiffSinceLastTag(
    repo,
    lastNativeTag,
    'android/app/build.gradle'
  )

  const nativeDiff = podfileDiff.total > 0 || gradleDiff.total > 0

  if (nativeDiff) {
    const { version } = await reactNativeVersionUp({
      pathToRoot,
      patch: 'patch'
    })

    return {
      ...input,
      newTag: `v${version}`
    }
  }

  // There was no native change, just codepush
  const codePushTags = tags.all.filter(tag =>
    tag.match(new RegExp('v' + info.version + '-codepush'))
  )

  return {
    ...input,
    newTag: `v${info.version}-codepush.${codePushTags.length + 1}`
  }
}

const generateNewTag = input => {
  if (!input) return false
  const { tags } = input

  const newTag = tag.generateTagName(tags.all)

  return {
    ...input,
    newTag
  }
}

const getDiff = async input => {
  if (!input) return false
  const { repo, app, latestTag, oraPull } = input

  const diff = await getDiffSinceLastTag(repo, latestTag)
  oraPull.stop()

  if (diff.total === 0) {
    output(
      chalk.yellow(
        `There is nothing new to be released for the app ${app.displayName}.`
      )
    )

    return false
  }

  output(chalk.yellow(`Last tag is ${latestTag}`))
  outputDiff(diff.all)

  return {
    ...input,
    diff
  }
}

const confirmTag = async input => {
  if (!input) return false

  const { confirmed } = await prompts({
    type: 'toggle',
    name: 'confirmed',
    message: `Can you confirm this?`,
    initial: true,
    active: 'yes',
    inactive: 'no'
  })

  if (!confirmed) {
    output(chalk.yellow('K, thx, bye.'))
    return false
  }

  return {
    ...input,
    confirmed
  }
}

const handleDepenedencies = async input => {
  if (!input) return false
  const { app } = input

  if (app.dependencies.length > 0) {
    output(
      chalk.magenta(
        `The app ${app.displayName} has apps dependent on it, we suggest to deploy them as well`
      )
    )

    const { selectedApps } = await prompts({
      type: 'multiselect',
      name: 'selectedApps',
      message: 'Select the apps you want to deploy:',
      choices: apps
        .filter(({ name }) => app.dependencies.includes(name))
        .map(app => ({
          title: app.displayName,
          value: app,
          selected: true
        }))
    })

    await Promise.all(selectedApps.map(app => releaseApp(app)))
  }

  return input
}

const pushNewTag = async input => {
  if (!input) return false
  const { repo, newTag, app } = input

  const oraTagAndPush = ora('Tagging and pushing...').start()
  await tagAndPush(repo, newTag)
  oraTagAndPush.succeed(`Released ${app.displayName}!`)

  return input
}

const finish = input => {
  if (!input) {
    return output(chalk.yellow('Hope to be more useful next time...'))
  }

  return output(chalk.green('My job here is done! Allahimanet.'))
}

module.exports = {
  command: 'release',
  description: 'Releases UBDI apps',
  exec: async () => {
    const { app } = await prompts({
      type: 'select',
      name: 'app',
      message: 'Which app do you want to deploy?',
      choices: apps.map(app => ({
        title: app.displayName,
        value: app
      }))
    })

    if (!app) output(chalk.red('OK, no problem. I am not angry.'))

    await releaseApp(app)
  }
}
