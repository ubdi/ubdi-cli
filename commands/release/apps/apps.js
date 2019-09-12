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
    dependencies: ['ubdi-api', 'insights'],
    reactNative: true
  },
  {
    name: 'insights',
    displayName: 'Insights Crunch',
    dependencies: ['mobile-ubdi-app']
  }
]
