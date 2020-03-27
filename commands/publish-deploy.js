const axios = require('axios')

const requiredArguments = ['app', 'env', 'deployer', 'slackWebhook']

const getDeployer = async username => {
  try {
    const { data: deployer } = await axios.get(
      `https://api.github.com/users/${username}`
    )

    return deployer
  } catch (error) {
    return null
  }
}

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
      .option('jobUrl', {
        describe: 'URL to the job on CI'
      })
      .option('failed', {
        describe: 'marks the job as failed'
      })
      .demandOption(
        requiredArguments,
        `Required arguments: ${requiredArguments.join(', ')}`
      ),
  exec: async args => {
    const endPoint = `https://hooks.slack.com/services/${args.slackWebhook}`

    const deployer = await getDeployer(args.deployer)

    const appInfoMessage = `of *${args.app}* to *${args.env}* ${
      args.env.toLowerCase() === 'production' ? ':dart:' : ':dancer:'
    }`

    const body = {
      text: 'test',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: !args.failed
              ? `:white_check_mark: Successful deployment ${appInfoMessage}`
              : `:fire: Deployment ${appInfoMessage} *failed*`
          }
        },
        (args.job || args.image) && {
          type: 'context',
          elements: [
            args.job && {
              type: 'mrkdwn',
              text: `Job: *${args.job}*`
            },
            args.image && {
              type: 'mrkdwn',
              text: `Image: *${args.image}*`
            }
          ].filter(i => !!i)
        },
        deployer && {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Deployed by *${deployer.name}*`
            },
            {
              type: 'image',
              image_url: deployer.avatar_url,
              alt_text: 'images'
            }
          ]
        }
      ].filter(i => !!i)
    }

    await axios.post(endPoint, body)
  }
}
