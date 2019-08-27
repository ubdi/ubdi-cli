module.exports = [
  {
    name: 'daas-app',
    displayName: 'DaaS Web App',
    dependencies: ['ubdi-api']
  },
  {
    name: 'ubdi-api',
    displayName: 'UBDI API',
    dependencies: ['daas-app', 'mobile-ubdi-app']
  },
  {
    name: 'mobile-ubdi-app',
    displayName: 'Mobile UBDI App',
    skipTag: true,
    releaseCommands: {
      native: ['yarn tag:beta'],
      codepush: ['yarn tag:beta:codepush']
    },
    dependencies: ['ubdi-api']
  }
]