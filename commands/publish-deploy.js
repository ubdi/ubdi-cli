const axios = require('axios')

const requiredArguments = ['app', 'env', 'deployer', 'slackWebhook']

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
      .option('deployer', { describe: 'github username of deployer' })
      .option('slackWebhook', {
        describe: 'slack webook (what goes after hooks.slack.com/services/)'
      })
      .demandOption(
        requiredArguments,
        `Required arguments: ${requiredArguments.join(', ')}`
      ),
  exec: async args => {
    const endPoint = `https://hooks.slack.com/services/${args.slackWebhook}`

    const { data: deployer } = await axios.get(
      `https://api.github.com/users/${args.deployer}`
    )

    const body = {
      attachments: [
        {
          text: 'Successful deployment',
          color: '#36a64f',
          author_name: deployer.name,
          author_icon: deployer.avatar_url,
          fields: [
            {
              title: 'Application',
              value: args.app,
              short: false
            },
            {
              title: 'Environment',
              value: args.env,
              short: false
            },
            args.image && {
              title: 'Image',
              value: args.image,
              short: false
            }
          ].filter(Boolean),
          footer: 'UBDI-CLI',
          ts: Math.round(new Date().getTime() / 1000)
        }
      ]
    }

    await axios.post(endPoint, body)
  }
}
