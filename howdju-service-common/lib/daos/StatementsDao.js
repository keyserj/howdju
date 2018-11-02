const {
  SentenceType,
  requireArgs,
} = require('howdju-common')

const {BaseDao, START_PREFIX} = require('./BaseDao')
const {toStatement} = require('./orm')

module.exports.StatementsDao = class StatementsDao extends BaseDao {
  constructor(logger, database, propositionsDao) {
    requireArgs({logger, database, propositionsDao})
    super(logger, database)
    this.mapper = toStatement
    this.propositionsDao = propositionsDao
  }

  async readStatementForId(statementId) {
    const statement = await this.readJustStatementForId(statementId)
    let sentence = statement
    let nextSentenceId = sentence.sentence.id
    while (nextSentenceId) {
      let nextSentence
      switch (sentence.sentenceType) {
        case SentenceType.STATEMENT: {
          nextSentence = await this.readJustStatementForId(nextSentenceId)
          nextSentenceId = nextSentence.sentence.id
          break
        }
        case SentenceType.PROPOSITION: {
          nextSentence = await this.propositionsDao.readPropositionForId(nextSentenceId)
          nextSentenceId = null
        }
      }
      sentence.sentence = nextSentence
      sentence = nextSentence
    }

    return statement
  }

  async readEquivalentStatement(statement) {
    return await this.queryOne(
      'readEquivalentStatement',
      `
        with 
          extant_users as (select * from users where deleted is null)
          , extant_persorgs as (select * from persorgs where deleted is null)
        select 
            s.*
          , '' as ${START_PREFIX}creator_
          , u.*
          , '' as ${START_PREFIX}speaker_
          , p.*
        from statements s 
          left join extant_users u on s.creator_user_id = u.user_id
          left join extant_persorgs p on s.speaker_persorg_id = p.persorg_id
          where 
                s.speaker_persorg_id = $1
            and s.sentence_type = $2
            and s.sentence_id = $3 
            and s.deleted is null
      `,
      [statement.speaker.id, statement.sentenceType, statement.sentence.id]
    )
  }

  async createStatement(statement, creatorUserId, now) {
    return await this.queryOne(
      'createStatement',
      `
        insert into statements 
          (sentence_type, sentence_id, speaker_persorg_id, root_proposition_id, creator_user_id, created) 
          values ($1, $2, $3, $4, $5, $6)
      `,
      [statement.sentenceType, statement.sentence.id, statement.speaker.id, statement.rootPropositionId,
        creatorUserId, now]
    )
  }

  async readJustStatementForId(statementId) {
    return await this.queryOne(
      'readJustStatementForId',
      `
        with 
          extant_users as (select * from users where deleted is null)
          extant_persorgs as (select * from persorgs where deleted is null)
        select 
            s.*
          , '' as _prefix__creator_
          , u.*
          , '' as _prefix__speaker_
          , p.*
        from statements s 
          left join extant_users u on s.creator_user_id = u.user_id
          left join extant_persorgs p on s.speaker_persorg_id = p.persorg_id
          where s.statement_id = $1 and s.deleted is null
      `,
      [statementId]
    )
  }
}
