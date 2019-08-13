#!/usr/bin/env node
// UBDL CLI Tool

const yargs = require('yargs')
const commands = require('./commands')

Object.values(commands).forEach(({ command, description, args, exec }) => {
  yargs.command(command, description, args ? args : () => {}, exec)
})

yargs.argv
