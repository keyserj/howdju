const Promise = require('bluebird')
const merge = require('lodash/merge')

const {
  statements,
  statementJustifications,
  login,
  logout,
  createUser,
  vote,
  unvote,
  createStatement,
  deleteStatement,
} = require('./service')
const {logger} = require('./logger')

const ok = ({callback, body={}, headers}) => callback({
  status: 'ok',
  headers,
  body
})
// NO CONTENT must not have a body. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204
const noContent = ({callback, body}) => {
  if (body) logger.error('noContent may not return a body.  Ignoring body')
  return callback({status: 'noContent'})
}
const notImplemented = ({callback}) => callback({
  status: 'error',
  body: {message: 'not implemented'}
})
const notFound = ({callback, message='not found'}) => callback({
  status: 'notFound',
  body: {message}
})
const unauthorized = ({callback, message='unauthenticated'}) => callback({
  status: 'unauthorized',
  body: {message},
})
const forbidden = ({callback, message='forbidden'}) => callback({
  status: 'forbidden',
  body: {message}
})
const badRequest = ({callback, message='bad request'}) => callback({
  status: 'badRequest',
  body: {message}
})
const error = ({callback, body={}}) => callback({
  status: 'error',
  body
})

const GET = 'GET'
const POST = 'POST'
const PUT = 'PUT'
const DELETE = 'DELETE'
const OPTIONS = 'OPTIONS'

const routes = [
  {
    method: OPTIONS,
    handler: ({callback}) => {
      const headers = {
        'Access-Control-Allow-Headers': 'Content-Type'
      }
      return ok({headers, callback})
    }
  },
  {
    path: 'statements',
    method: GET,
    handler: ({callback}) => statements()
        .then(statements => {
          console.log(`Returning ${statements.length} statements`)
          return ok({callback, body: statements})
        })
  },
  {
    id: 'createStatement',
    path: 'statements',
    method: POST,
    handler: ({
                callback,
                request: {
                  authToken,
                  body: {statement},
                  method,
                  path
                }
    }) => createStatement({authToken, statement})
        .then( ({isUnauthenticated, isInvalid, statement, isExtant}) => {
          if (isUnauthenticated) {
            return unauthorized({callback})
          } else if (isInvalid) {
            return badRequest({callback})
          } else if (statement) {
            return ok({callback, body: {statement, isExtant}})
          }
          logger.error(`It shouldn't be possible for ${method} ${path} to get here.`)
          return error({callback})
        })
  },
  {
    id: 'deleteStatement',
    path: new RegExp('^statements/([^/]+)$'),
    method: DELETE,
    handler: ({
                callback,
                request: {
                  authToken,
                  method,
                  path,
                  pathParameters: [statementId],
                }
    }) => deleteStatement({authToken, statementId}).then(({isUnauthenticated, isUnauthorized, isSuccess}) => {
      if (isUnauthenticated) {
        return unauthorized({callback})
      } else if (isUnauthorized) {
        return forbidden({callback})
      } else if (isSuccess) {
        return ok({callback})
      }
      logger.error(`It shouldn't be possible for ${method} ${path} to get here.`)
      return error({callback})
    })
  },
  {
    id: 'getStatement',
    path: new RegExp('^statements/([^/]+)$'),
    method: GET,
    handler: ({
                callback,
                request: {
                  pathParameters: [statementId],
                  authToken,
                  // TODO look at justifications query param
                  queryStringParameters
                }
    }) => statementJustifications({statementId, authToken})
        .then(({statement, justifications}) => {
          if (!statement) {
            return notFound({callback})
          } else {
            console.log(`Returning statement ${statement.id} with ${justifications.length} justifications`)
            return ok({callback, body: {statement, justifications}})
          }
        })
  },
  {
    path: 'login',
    method: POST,
    handler: ({callback, request: {body}}) => login(body)
        .then(({message, isInvalid, isNotFound, isNotAuthorized, auth}) => {
          if (isInvalid) {
            return badRequest({callback, message})
          }
          if (isNotFound) {
            return notFound({callback, message})
          }
          if (isNotAuthorized) {
            return forbidden({callback, message})
          }
          console.log(`Successfully authenticated ${auth.email}`)
          return ok({callback, body: auth})
        })
  },
  {
    path: 'logout',
    method: POST,
    handler: ({callback, request: {authToken}}) => logout({authToken})
        .then( () => ok({callback}) )
  },
  {
    path: new RegExp('^votes$'),
    method: POST,
    handler: ({callback, request: {body: {targetType, targetId, polarity}, authToken}}) =>
        vote({authToken, targetType, targetId, polarity})
            .then( ({isUnauthenticated, isAlreadyDone, vote}) => {
              if (isUnauthenticated) {
                return unauthorized({callback})
              } else if (isAlreadyDone) {
                return ok({callback, body: vote})
              }
              return ok({callback, body: vote})
            })
  },
  {
    path: new RegExp('^votes$'),
    method: DELETE,
    handler: ({callback, request: {body: {targetType, targetId, polarity}, authToken, method, path}}) =>
        // TODO base this on the vote_id instead?  Ensure the vote_id matches up with the other values passed?
        unvote({authToken, targetType, targetId, polarity})
            .then( ({isUnauthenticated, isAlreadyDone, isSuccess}) => {
              if (isUnauthenticated) {
                return unauthorized({callback})
              } else if (isAlreadyDone) {
                return noContent({callback})
              }
              if (isSuccess) {
                return ok({callback})
              }
              logger.error(`It shouldn't be possible for ${method} ${path} to get here.`)
              return error({callback})
            })
  },
  {
    path: 'users',
    method: POST,
    handler: ({callback, request: {body: {credentials: {email, password}, authToken}}}) => createUser(body)
        .then( ({message, notAuthorized, user}) => {
          if (notAuthorized) {
            return forbidden({callback, message})
          } else {
            console.log(`Successfully created user ${user.id}`)
            return ok({callback, body: {user}})
          }
        })
  },
]

function selectRoute({path, method, queryStringParameters}) {
  let match;
  for (let route of routes) {
    if (!route.path && route.method === method) {
      return Promise.resolve({route})
    }
    if (typeof route.path === 'string' &&
        route.path === path &&
        route.method === method
    ) {
      return Promise.resolve({route})
    }
    if (route.path instanceof RegExp &&
        (match = route.path.exec(path)) &&
        (!route.method || route.method === method)
    ) {
      // First item is the whole match
      const pathParameters = match.slice(1)
      return Promise.resolve({route, pathParameters})
    }
  }

  return Promise.resolve({route: null})
}

const routeEvent = ({callback, request}) =>
  selectRoute(request)
      .then( ({route, pathParameters}) => {
        if (!route) {
          console.log(`No route for ${request.method} ${request.path}`)
          return notFound({callback})
        }
        return route.handler({callback, request: merge({}, request, {pathParameters})})
      })

module.exports = {
  routes,
  routeEvent
}