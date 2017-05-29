const map = require('lodash/map')
const groupBy = require('lodash/groupBy')
const sortBy = require('lodash/sortBy')

const urlsDao = require('./urlsDao')
const citationsDao = require('./citationsDao')
const {
  toCitationReference,
} = require("../orm")
const {query, queries} = require('./../db')
const {
  JustificationBasisType,
  JustificationTargetType,
  VoteTargetType,
} = require('../models')
const {logger} = require('../logger')


class CitationReferencesDao {
  doOtherCitationReferencesHaveSameQuoteAs(citationReference) {
    const sql = `
      select count(*) > 0 has_conflict 
      from citation_references
        where 
              citation_reference_id != $1 
          and quote = $2
          -- we need to let users recreate things that don't exist
          and deleted is null
      `
    return query(sql, [citationReference.id, citationReference.quote])
        .then( ({rows: [{has_conflict}]}) => has_conflict)
  }

  hasChanged(citationReference) {
    const sql = `
      select count(*) < 1 as has_changed
      from citation_references 
        where citation_reference_id = $1 and quote = $2
      `
    return query(sql, [citationReference.id, citationReference.quote])
        .then( ({rows: [{has_changed}]}) => has_changed )
  }

  isBasisToJustificationsHavingOtherUsersVotes(userId, citationReference) {
    const sql = `
      with
        basis_justifications as (
          select *
          from justifications
            where basis_type = $1 and basis_id = $2 and deleted is null
        )
        , basis_justification_votes as (
          select * from votes v
            join basis_justifications j on
                  v.user_id != $3
              and v.target_type = $4 
              and v.target_id = j.justification_id
              and v.deleted is null
        )
      select count(*) > 0 as has_votes from basis_justification_votes
    `
    return query(sql, [
      JustificationBasisType.CITATION_REFERENCE,
      citationReference.id,
      userId,
      VoteTargetType.JUSTIFICATION,
    ]).then( ({rows: [{has_votes: isBasisToJustificationsHavingOtherUsersVotes}]}) => isBasisToJustificationsHavingOtherUsersVotes)
  }

  isBasisToOtherUsersJustifications(userId, citationReference) {
    const sql = `
      select count(*) > 0 as has_other_users_justifications 
      from justifications where 
            basis_type = $1 
        and basis_id = $2 
        and creator_user_id != $3
        and deleted is null
        `
    return query(sql, [
      JustificationBasisType.CITATION_REFERENCE,
      citationReference.id,
      userId,
    ]).then( ({rows: [{has_other_users_justifications: isBasisToOtherUsersJustifications}]}) => isBasisToOtherUsersJustifications)
  }

  isBasisToJustificationsHavingOtherUsersCounters(userId, citationReference) {
    const sql = `
      with
        basis_justifications as (
          select *
          from justifications
            where basis_type = $1 and basis_id = $2 and deleted is null
        )
        , counters as (
          select * from justifications cj join basis_justifications j on 
                cj.creator_user_id != $3 
            and cj.target_type = $4 
            and cj.target_id = j.justification_id
            and cj.deleted is null
        )
      select count(*) > 0 as has_other_user_counters from counters
    `
    return query(sql, [
      JustificationBasisType.CITATION_REFERENCE,
      citationReference.id,
      userId,
      JustificationTargetType.JUSTIFICATION,
    ]).then( ({rows: [{has_other_user_counters: isBasisToJustificationsHavingOtherUsersCounters}]}) => isBasisToJustificationsHavingOtherUsersCounters)
  }

  update(citationReference) {
    return Promise.all([
      query('update citation_references set quote = $1 where citation_reference_id = $2 returning *', [citationReference.quote, citationReference.id]),
      urlsDao.update(citationReference.id, citationReference.urls)
    ])
        .then( ([
          {rows: [citationReferenceRow]},
          newUrls,
        ]) => {
          const citationReference = toCitationReference(citationReferenceRow)
          citationReference.urls = newUrls
          return citationReference
        })
  }
}

module.exports = new CitationReferencesDao()