const assign = require('lodash/assign')

module.exports = assign(
  {},
  require('./ActionsDao'),
  require('./AuthDao'),
  require('./JobHistoryDao'),
  require('./JustificationsDao'),
  require('./JustificationBasisCompoundsDao'),
  require('./JustificationScoresDao'),
  require('./JustificationVotesDao'),
  require('./PasswordResetRequestsDao'),
  require('./PermissionsDao'),
  require('./PerspectivesDao'),
  require('./PersorgsDao'),
  require('./PicRegionsDao'),
  require('./PropositionCompoundsDao'),
  require('./PropositionTagScoresDao'),
  require('./PropositionTagVotesDao'),
  require('./PropositionTagsDao'),
  require('./PropositionsDao'),
  require('./RegistrationRequestsDao'),
  require('./SourceExcerptParaphrasesDao'),
  require('./StatementsDao'),
  require('./TagsDao'),
  require('./UrlsDao'),
  require('./UserExternalIdsDao'),
  require('./UserGroupsDao'),
  require('./UserPermissionsDao'),
  require('./UsersDao'),
  require('./VidSegmentsDao'),
  require('./WritQuotesDao'),
  require('./WritQuoteUrlTargetsDao'),
  require('./WritsDao'),
  require('./orm')
)
