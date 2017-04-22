const Promise = require('bluebird')
const pg = require('pg')
const {logger} = require('./logger')

const config = {
  user: process.env['DB_USER'],
  database: process.env['DB_NAME'],
  password: process.env['DB_PASSWORD'],
  host: process.env['DB_HOST'],
  port: process.env['DB_PORT'] || 5432,
  max: process.env['DB_POOL_MAX_CLIENTS'] || 10,
  idleTimeoutMillis: process.env['DB_CLIENT_TIMEOUT'] || 3000,
}

const pool = new pg.Pool(config)

pool.on('error', (err, client) => console.error('idle client error', err.message, err.stack))

exports.query = (query, args) => Promise.resolve(
    pool.connect().then(client => {
      logger.silly('db.query:', {query, args})
      return Promise.resolve(client.query(query, args)).finally(() => client.release())
    })
)
exports.queries = queryAndArgs => Promise.resolve(
    pool.connect().then(client => Promise
        .all(queryAndArgs.map( ({query, args}) => {
          logger.silly('db.query:', {query, args})
          return client.query.call(client, query, args)
        } ))
        .finally(() => client.release()))
)