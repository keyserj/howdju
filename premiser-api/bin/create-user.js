const {ArgumentParser} = require('argparse')
const read = require('read')
const Promise = require('bluebird')

const {
  loadEnvironmentEnvVars,
  logger,
} = require('howdju-ops')
loadEnvironmentEnvVars('../../config/local-prod.env')

const {
  pool
} = require('../src/initialization/databaseInitialization')
const {
  usersService,
  permissionsService,
  groupsService,
} = require('../src/initialization')

const parser = new ArgumentParser({
  description: 'Add a user'
})
parser.addArgument('--email', {required: true})
parser.addArgument('--shortName')
parser.addArgument('--longName')
parser.addArgument('--phoneNumber')
parser.addArgument('--inactive', {action: 'storeTrue'})
parser.addArgument('--creatorUserId', {required: true})
parser.addArgument('--groups', {help: 'comma-delimited list'})
parser.addArgument('--permissions', {help: 'comma-delimited list'})
const args = parser.parseArgs()

read({ prompt: `Please enter the password for ${args.email}:`, silent: true }, createUserWithPassword)

function createUserWithPassword(error, password) {
  if (error) throw error

  const creatorUserId = args.creatorUserId
  const user = {
    email: args.email,
    shortName: args.shortName,
    longName: args.longName,
    phoneNumber: args.phoneNumber,
    isActive: !args.inactive,
  }
  return usersService.createUserAsUser(creatorUserId, user, password)
    .then( user => {
      logger.info(`Created user ${user.id} (${user.email})`)
      return user
    })
    .then( (user) => {
      return Promise.all([
        user,
        addPermissionsToUser(user, args.permissions)
      ])
    })
    .then( ([user]) => Promise.all([
      user,
      addUserToGroups(user, args.groups)
    ]))
    .finally(() => pool.end())
}

const addPermissionsToUser = (user, permissions) => {
  if (permissions) {
    const permissionNames = permissions.split(',')
    return permissionsService.addPermissionsToUser(user, permissionNames)
      .then(() => logger.info(`Granted user ${user.id} permissions: ${permissions}`))
  }
  return Promise.resolve()
}

const addUserToGroups = (user, groups) => {
  if (groups) {
    const groupNames = groups.split(',')
    return groupsService.addUserToGroups(user, groupNames)
      .then(() => logger.info(`Added user ${user.id} to groups: ${groups}`))
  }
  return Promise.resolve()
}
