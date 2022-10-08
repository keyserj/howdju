const concat = require('lodash/concat')
const deburr = require('lodash/deburr')
const forEach = require('lodash/forEach')
const head = require('lodash/head')
const isNumber = require('lodash/isNumber')
const join = require('lodash/join')
const map = require('lodash/map')
const replace = require('lodash/replace')
const toLower = require('lodash/toLower')
const toNumber = require('lodash/toNumber')

const {
  assert,
  JustificationTargetTypes,
  newProgrammingError,
  idEqual,
  newImpossibleError,
  cleanWhitespace,
} = require('howdju-common')


exports.normalizeText = text => {

  // Postgres SQL for the same
  // regexp_replace(lower(regexp_replace(trim(text), '\s+', ' ', 'g')), '[^[:alnum:][:space:]_.]', '', 'g')
  text = toLower(text)
  text = deburr(text)
  text = replace(text, /[^\w\s]/g, '')
  text = cleanWhitespace(text)

  return text
}

exports.mapSingle = (logger, mapper, tableName, identifiers) => ({rows}) => {
  // Some queries, such as insert, have no chance for returning multiple rows.  So then the caller doesnt' pass the logger
  let requireOne = false
  if (!mapper) {
    mapper = logger
    logger = null
    requireOne = true
  }

  if (logger && rows.length > 1) {
    const identifiersString = join(map(identifiers, (val, key) => `${key} ${val}`), ', ')
    logger.warn(`Multiple (${rows.length}) ${tableName} for ${identifiersString}`)
  }

  const row = head(rows)
  if (requireOne && !row) {
    throw newImpossibleError('Missing required row')
  }
  return mapper(row)
}

exports.mapMany = (mapper) => ({rows}) => map(rows, mapper)

exports.mapManyById = (mapper) => ({rows}) => {
  const byId = {}
  forEach(rows, row => {
    const entity = mapper(row)
    byId[entity.id] = entity
  })
  return byId
}

exports.groupRootJustifications = (rootTargetType, rootTargetId, justification_rows) => {
  const rootJustifications = [], counterJustificationsByJustificationId = {}
  for (let justification_row of justification_rows) {
    // There are two types of justifications: those targeting other justifications or those targeting the current root
    if (justification_row.target_type === JustificationTargetTypes.JUSTIFICATION) {
      assert( () => justification_row.target_type === JustificationTargetTypes.JUSTIFICATION)
      if (!Object.prototype.hasOwnProperty.call(counterJustificationsByJustificationId, justification_row.target_id)) {
        counterJustificationsByJustificationId[justification_row.target_id] = []
      }
      counterJustificationsByJustificationId[justification_row.target_id].push(justification_row)
    } else {
      assert(() => justification_row.root_target_type === rootTargetType)
      assert(() => justification_row.target_type === rootTargetType)
      assert(() => idEqual(justification_row.target_id, rootTargetId))
      rootJustifications.push(justification_row)
    }
  }
  return {
    rootJustifications,
    counterJustificationsByJustificationId,
  }
}

/** Renumber the SQL arguments starting from after {@link after} */
exports.renumberSqlArgs = (sql, after) => {
  if (!isNumber(after) || after < 0) {
    throw newProgrammingError('after must be a non-negative number')
  }
  if (after === 0) {
    // Nothing to do
    return sql
  }

  const renumberedSql = sql.replace(/\$(\d+)/g, (match, paramNumber) => {
    const paramNumberNumber = toNumber(paramNumber)
    const paramRenumber = paramNumberNumber + after
    return `$${paramRenumber}`
  })

  return renumberedSql
}

exports.addArrayParams = function addArrayParams(baseArgs, values) {
  const params = []
  const start = baseArgs.length + 1
  for (let i = 0 ; i < values.length; i++) {
    params.push('$' + (i + start))
  }
  return {
    params,
    args: concat(baseArgs, values),
  }
}

exports.createParams = function createParams(count, start) {
  return map(Array.from(Array(count).keys()), (i) => '$' + (i+start))
}
