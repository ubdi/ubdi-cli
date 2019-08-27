const prompts = require('prompts')
const os = require('os')
const fs = require('fs')

const configFileLocation = `${os.homedir()}/.ubdi-cli`

module.exports = async variables =>
  new Promise((resolve, reject) => {
    fs.readFile(configFileLocation, async (err, rawConfig) => {
      if (err || !rawConfig) {
        const enteredVariables = await prompts(
          variables.map(name => ({
            message: `Enter path for ${name}`,
            type: 'text',
            name
          }))
        )

        fs.writeFile(
          configFileLocation,
          JSON.stringify(enteredVariables),
          { flag: 'w' },
          err => {
            if (err) return reject(err)
            return resolve(enteredVariables)
          }
        )

        return resolve(enteredVariables)
      }

      return resolve(JSON.parse(rawConfig))
    })
  })
