const { format } = require('date-fns')

const generateTagName = (tags, i = 0) => {
  const tag = `v${format(new Date(), 'YYYY.MM.DD') + (i > 0 ? `.${i}` : '')}`
  if (tags.indexOf(tag) >= 0) {
    return generateTagName(tags, i + 1)
  } else {
    return tag
  }
}

module.exports = {
  generateTagName
}
