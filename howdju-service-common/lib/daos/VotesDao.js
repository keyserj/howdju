const map = require('lodash/map')

const {negateVotePolarity} = require('howdju-common')

const {toVote} = require('./orm')


exports.VotesDao = class VotesDao {

  constructor(database) {
    this.database = database
  }

  deleteOpposingVotes(userId, vote) {
    const {targetType, targetId, polarity} = vote

    const sql = `
      update votes 
        set deleted = $1 
        where 
              user_id = $2 
          and target_type = $3 
          and target_id = $4 
          and polarity = $5 
          and deleted is null
        returning vote_id`
    return this.database.query(sql, [new Date(), userId, targetType, targetId, negateVotePolarity(polarity)])
      .then( ({rows}) => map(rows, r => r.vote_id))
  }

  readEquivalentVotes(userId, vote) {
    const {targetType, targetId, polarity} = vote
    const sql = `
      select * 
      from votes 
        where 
              user_id = $1
          and target_type = $2 
          and target_id = $3 
          and polarity = $4
          and deleted is null`
    return this.database.query(sql, [userId, targetType, targetId, polarity])
      .then( ({rows}) => map(rows, toVote))
  }

  createVote(userId, vote) {
    const {targetType, targetId, polarity} = vote
    const sql = `
      insert into votes (user_id, target_type, target_id, polarity, created) 
      values ($1, $2, $3, $4, $5) 
      returning *`
    return this.database.query(sql, [userId, targetType, targetId, polarity, new Date()])
      .then( ({rows: [row]}) => toVote(row) )
  }

  deleteEquivalentVotes(userId, vote) {
    const {targetType, targetId, polarity} = vote
    const sql = `
      update votes 
        set deleted = $1 
        where 
              user_id = $2 
          and target_type = $3 
          and target_id = $4 
          and polarity = $5 
          and deleted is null
        returning vote_id`
    return this.database.query(sql, [new Date(), userId, targetType, targetId, polarity])
      .then( ({rows}) => map(rows, r => r.vote_id))
  }

  readVotesForTypeSince(voteTargetType, lastRun) {
    return this.database.query('select * from votes where target_type = $1 and created > $2 and deleted is null',
      [voteTargetType, lastRun])
      .then( ({rows}) => map(rows, toVote))
  }

  readVotesForType(voteTargetType) {
    return this.database.query('select * from votes where target_type = $1 and deleted is null', [voteTargetType])
      .then( ({rows}) => map(rows, toVote))
  }
}