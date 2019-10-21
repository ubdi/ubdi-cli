const { format } = require('date-fns')

const generateTagName = (tags, lane, i = 0) => {
  const dateStr = format(new Date(), 'YYYY.MM.DD')
  const incStr = i > 0 ? `.${i}` : ''
  const laneStr = lane ? `-${lane}` : ''

  const tag = `v${dateStr}${laneStr}${incStr}`

  if (tags.indexOf(tag) >= 0) {
    return generateTagName(tags, lane, i + 1)
  } else {
    return tag
  }
}

module.exports = {
  generateTagName
}
