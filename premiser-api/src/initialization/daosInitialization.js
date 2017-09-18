const {
  ActionsDao,
  AuthDao,
  WritQuotesDao,
  WritsDao,
  JobHistoryDao,
  JustificationScoresDao,
  JustificationsDao,
  JustificationBasisCompoundsDao,
  PermissionsDao,
  PerspectivesDao,
  PicRegionsDao,
  SourceExcerptParaphrasesDao,
  StatementCompoundsDao,
  StatementsDao,
  UserExternalIdsDao,
  UserGroupsDao,
  UserPermissionsDao,
  UsersDao,
  UrlsDao,
  VotesDao,
  VidSegmentsDao,
} = require('howdju-service-common')
const {
  database,
} = require('./databaseInitialization')
const {
  logger
} = require('./loggerInitialization')

exports.actionsDao = new ActionsDao(database)
exports.authDao = new AuthDao(logger, database)

exports.urlsDao = new UrlsDao(logger, database)
exports.writQuotesDao = new WritQuotesDao(logger, database, exports.urlsDao)

exports.writsDao = new WritsDao(logger, database)
exports.jobHistoryDao = new JobHistoryDao(database)
exports.justificationScoresDao = new JustificationScoresDao(database)

exports.statementCompoundsDao = new StatementCompoundsDao(logger, database)
exports.statementsDao = new StatementsDao(logger, database)
exports.picRegionsDao = new PicRegionsDao(logger, database)
exports.vidSegmentsDao = new VidSegmentsDao(logger, database)

exports.sourceExcerptParaphrasesDao = new SourceExcerptParaphrasesDao(logger, database, exports.statementsDao,
  exports.writQuotesDao, exports.picRegionsDao, exports.vidSegmentsDao)

exports.justificationBasisCompoundsDao = new JustificationBasisCompoundsDao(logger, database, exports.sourceExcerptParaphrasesDao)

exports.justificationsDao = new JustificationsDao(logger, database, exports.statementCompoundsDao, exports.writQuotesDao,
  exports.justificationBasisCompoundsDao)

exports.permissionsDao = new PermissionsDao(logger, database)
exports.perspectivesDao = new PerspectivesDao(logger, database)

exports.userExternalIdsDao = new UserExternalIdsDao(database)
exports.userGroupsDao = new UserGroupsDao(database)
exports.userPermissionsDao = new UserPermissionsDao(database)
exports.usersDao = new UsersDao(logger, database)
exports.votesDao = new VotesDao(database)
