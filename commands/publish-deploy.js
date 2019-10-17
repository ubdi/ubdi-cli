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
    const deployerBody = deployer
      ? {
          author_name: deployer.name,
          author_icon: deployer.avatar_url
        }
      : {
          author_name: 'Unknown Author'
        }

    const body = {
      attachments: [
        {
          ...deployerBody,
          text: !args.failed ? 'Successful deployment' : 'Deployment failed',
          color: !args.failed ? '#36a64f' : '#ee5253',
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
            args.jobUrl && {
              title: 'Job',
              value: args.jobUrl,
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
