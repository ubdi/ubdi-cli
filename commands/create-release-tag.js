const { format } = require('date-fns')
const { execBash } = require('../utils')

const generateTagName = (tags, i = 0) => {
  const tag = `v${format(new Date(), 'YYYY.MM.DD') + (i > 0 ? `.${i}` : '')}`
  if (tags.indexOf(tag) >= 0) {
    return generateTagName(tags, i + 1)
  } else {
    return tag
  }
}

const getTags = async () => {
  const tags = await execBash('git tag')
  return tags.split('\n').filter(Boolean)
}

module.exports = {
  command: 'create-release-tag',
  description: 'Creates and pushes a release tag to Git',
  exec: async () => {
    const tags = await getTags()
    const tag = generateTagName(tags)

    console.log(`Tagging release with ${tag}`)
    await execBash(`git tag ${tag}`)

    console.log('Pushing to Github...')
    await execBash('git push --tags')

    console.log('Done')
  }
}
