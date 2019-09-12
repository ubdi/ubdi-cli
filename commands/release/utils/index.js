const getTags = (repo, options) =>
  new Promise((resolve, reject) => {
    repo
      .pull('origin', 'master', { '--tags': true })
      .tags(options, (err, tags) => {
        if (err) return reject(err)
        return resolve(tags)
      })
  })

const getDiffSinceLastTag = (repo, lastTag, file) =>
  new Promise((resolve, reject) =>
    repo.log({ from: lastTag, to: 'HEAD', file }, (err, log) => {
      if (err) return reject(err)
      return resolve(log)
    })
  )

const checkoutMaster = repo =>
  new Promise((resolve, reject) => {
    repo.checkout('master', err => {
      if (err) return reject(err)
      return resolve()
    })
  })

const tagAndPush = (repo, newTag) =>
  new Promise((resolve, reject) => {
    repo.addAnnotatedTag(newTag, newTag, (err, addedTag) => {
      if (err) return reject(err)
      repo.pushTags('origin', err => {
        if (err) return reject(err)
        resolve(addedTag)
      })
    })
  })

module.exports = {
  getTags,
  getDiffSinceLastTag,
  checkoutMaster,
  tagAndPush
}
