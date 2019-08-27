const { getDiffSinceLastTag } = require('../../utils')

const getLastTag = (prefix = '') => tags => {
  const matchedTags = tags
    .map(tag => tag.match(new RegExp(prefix + '\\/v(\\d*)')))
    .filter(t => t)
    .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))

  return matchedTags[0].input
}

const getLastNativeTag = getLastTag('release_beta')

module.exports = async ({ app, repo, tags }) => {
  const lastNativeTag = getLastNativeTag(tags.all)
  const podfileDiff = await getDiffSinceLastTag(
    repo,
    lastNativeTag,
    'ios/Podfile.lock'
  )

  const gradleDiff = await getDiffSinceLastTag(
    repo,
    lastNativeTag,
    'android/app/build.gradle'
  )

  const nativeDiff = podfileDiff.total > 0 || gradleDiff.total > 0

  return {
    latestTag: getLastTag()(tags.all),
    releaseCommands: app.releaseCommands[nativeDiff ? 'native' : 'codepush']
  }
}
