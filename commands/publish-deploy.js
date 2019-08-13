const axios = require('axios')

module.exports = {
  command: 'publish-deploy',
  description: 'Publishes a deploy to Slack',
  args: yargs =>
    yargs
      .option('app', {
        describe: 'app name'
      })
      .option('env', { describe: 'deployment environment' })
      .option('image', { describe: 'docker image deployed' })
      .demandOption(
        ['app', 'env'],
        'Please provide both app and env arguments'
      ),
  exec: async args => {
    const endPoint =
      'https://hooks.slack.com/services/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'

    const body = {
      text: 'Ok',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'Deployment successful :white_check_mark:',
            emoji: true
          }
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `*Application:* ${args.app}` },
            { type: 'mrkdwn', text: `*Environment:* ${args.env}` },
            args.image && {
              type: 'mrkdwn',
              text: `*Image*: ${args.image}`
            }
          ].filter(Boolean)
        }
      ]
    }

    await axios.post(endPoint, body)
  }
}
