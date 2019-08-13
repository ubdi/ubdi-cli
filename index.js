// UBDL CLI Tool

const yargs = require('yargs')
const commands = require('./commands')

Object.values(commands).forEach(({ command, description, exec }) => {
  yargs.command(
    command,
    description,
    () => {},
    () => {
      exec()
    }
  )
})

yargs.argv
