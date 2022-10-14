import isEmpty from 'lodash/isEmpty'
import join from 'lodash/join'
import pick from 'lodash/pick'
import queryString from 'query-string'

import {
  decircularizeJustification,
  decircularizeProposition,
  encodeQueryStringObject,
  httpMethods,
  JustificationRootTargetTypes,
  SortDirections,
} from 'howdju-common'

import {
  api,
  str,
} from "../actions"
import {
  justificationSchema,
  justificationsSchema,
  justificationVoteSchema,
  mainSearchResultsSchema,
  perspectivesSchema,
  persorgSchema,
  persorgsSchema,
  propositionSchema,
  propositionsSchema,
  propositionCompoundSchema,
  propositionTagVoteSchema,
  sourceExcerptParaphraseSchema,
  statementSchema,
  statementsSchema,
  tagSchema,
  tagsSchema,
  writQuoteSchema,
  writsSchema,
  writQuotesSchema,
} from '../normalizationSchemas'


const defaultSorts = `created=${SortDirections.DESCENDING}`

const rootTargetEndpointsByType = {
  [JustificationRootTargetTypes.PROPOSITION]: {
    endpoint: 'propositions',
    normalizationSchema: {proposition: propositionSchema},
  },
  [JustificationRootTargetTypes.STATEMENT]: {
    endpoint: 'statements',
    normalizationSchema: {statement: statementSchema},
  },
}

export const resourceApiConfigs = {

  /* Entity CRUD */

  [api.fetchPropositions]: (payload) => {
    const query = payload.propositionIds ?
      `?${queryString.stringify({propositionIds: join(payload.propositionIds, ',')})}` :
      ''
    return {
      endpoint: `propositions${query}`,
      normalizationSchema: {propositions: propositionsSchema},
    }
  },
  [api.fetchProposition]: (payload) => ({
    endpoint: `propositions/${payload.propositionId}`,
    normalizationSchema: {proposition: propositionSchema},
  }),
  [api.fetchPropositionCompound]: (payload) => ({
    endpoint: `proposition-compounds/${payload.propositionCompoundId}`,
    normalizationSchema: {propositionCompound: propositionCompoundSchema},
  }),
  [api.fetchSourceExcerptParaphrase]: (payload) => ({
    endpoint: `source-excerpt-paraphrases/${payload.sourceExcerptParaphraseId}`,
    normalizationSchema: {sourceExcerptParaphrase: sourceExcerptParaphraseSchema},
  }),
  [api.fetchWritQuote]: (payload) => ({
    endpoint: `writ-quotes/${payload.writQuoteId}`,
    normalizationSchema: {writQuote: writQuoteSchema},
  }),
  [api.createWritQuote]: (payload) => ({
    endpoint: `writ-quotes`,
    fetchInit: {
      method: httpMethods.POST,
      body: payload
    },
    normalizationSchema: {writQuote: writQuoteSchema},
  }),
  [api.updateWritQuote]: (payload) => ({
    endpoint: `writ-quotes/${payload.writQuote.id}`,
    fetchInit: {
      method: httpMethods.PUT,
      body: payload
    },
    normalizationSchema: {writQuote: writQuoteSchema},
  }),
  [api.createProposition]: (payload) => ({
    endpoint: 'propositions',
    fetchInit: {
      method: httpMethods.POST,
      body: payload
    },
    normalizationSchema: {proposition: propositionSchema}
  }),
  [api.updateProposition]: (payload) => ({
    endpoint: `propositions/${payload.proposition.id}`,
    normalizationSchema: {proposition: propositionSchema},
    fetchInit: {
      method: httpMethods.PUT,
      body: {
        proposition: decircularizeProposition(payload.proposition)
      }
    },
  }),
  [api.createStatement]: (payload) => ({
    endpoint: 'statements',
    fetchInit: {
      method: httpMethods.POST,
      body: payload
    },
    normalizationSchema: {statement: statementSchema}
  }),
  [api.createJustification]: (payload) => ({
    endpoint: 'justifications',
    fetchInit: {
      method: httpMethods.POST,
      body: {
        justification: decircularizeJustification(payload.justification),
      }
    },
    normalizationSchema: {justification: justificationSchema}
  }),
  [api.deleteProposition]: (payload) => ({
    endpoint: `propositions/${payload.proposition.id}`,
    fetchInit: {
      method: httpMethods.DELETE,
    },
  }),
  [api.deleteJustification]: (payload) => ({
    endpoint: `justifications/${payload.justification.id}`,
    fetchInit: {
      method: httpMethods.DELETE,
    },
  }),
  [api.fetchTag]: (payload) => ({
    endpoint: `tags/${payload.tagId}`,
    normalizationSchema: {tag: tagSchema}
  }),
  [api.fetchPersorg]: (payload) => ({
    endpoint: `persorgs/${payload.persorgId}`,
    normalizationSchema: {persorg: persorgSchema},
  }),
  [api.updatePersorg]: (payload) => ({
    endpoint: `persorgs/${payload.persorg.id}`,
    normalizationSchema: {persorg: persorgSchema},
    fetchInit: {
      method: httpMethods.PUT,
      body: payload
    },
  }),

  /* Recents */

  [api.fetchRecentPropositions]: (payload) => {
    const queryStringParams = pick(payload, ['continuationToken', 'count'])
    if (!queryStringParams.continuationToken) {
      queryStringParams.sorts = defaultSorts
    }
    const queryStringParamsString = queryString.stringify(queryStringParams)
    return {
      endpoint: 'propositions?' + queryStringParamsString,
      normalizationSchema: {propositions: propositionsSchema},
    }
  },
  [api.fetchRecentWrits]: (payload) => {
    const queryStringParams = pick(payload, ['continuationToken', 'count'])
    if (!queryStringParams.continuationToken) {
      queryStringParams.sorts = defaultSorts
    }
    const queryStringParamsString = queryString.stringify(queryStringParams)
    return {
      endpoint: 'writs?' + queryStringParamsString,
      normalizationSchema: {writs: writsSchema},
    }
  },
  [api.fetchRecentWritQuotes]: (payload) => {
    const queryStringParams = pick(payload, ['continuationToken', 'count'])
    if (!queryStringParams.continuationToken) {
      queryStringParams.sorts = defaultSorts
    }
    const queryStringParamsString = queryString.stringify(queryStringParams)
    return {
      endpoint: 'writ-quotes?' + queryStringParamsString,
      normalizationSchema: {writQuotes: writQuotesSchema},
    }
  },
  [api.fetchRecentJustifications]: (payload) => {
    const queryStringParams = pick(payload, ['continuationToken', 'count'])
    if (!queryStringParams.continuationToken) {
      queryStringParams.sorts = defaultSorts
    }
    const queryStringParamsString = queryString.stringify(queryStringParams)
    return {
      endpoint: 'justifications?' + queryStringParamsString,
      normalizationSchema: {justifications: justificationsSchema},
    }
  },

  /* Pages */

  [api.fetchFeaturedPerspectives]: (payload) => ({
    endpoint: 'perspectives?featured',
    normalizationSchema: {perspectives: perspectivesSchema},
  }),

  [api.fetchRootJustificationTarget]: (payload) => {
    const {
      rootTargetType,
      rootTargetId,
    } = payload
    const {endpoint, normalizationSchema} = rootTargetEndpointsByType[rootTargetType]
    return {
      endpoint: `${endpoint}/${rootTargetId}?include=justifications`,
      fetchInit: {
        method: httpMethods.GET,
      },
      normalizationSchema,
    }
  },

  [api.fetchTaggedPropositions]: (payload) => ({
    endpoint: `propositions?tagId=${payload.tagId}`,
    normalizationSchema: {propositions: propositionsSchema},
  }),

  [api.fetchSpeakerStatements]: (payload) => ({
    endpoint: `statements?speakerPersorgId=${payload.speakerPersorgId}`,
    normalizationSchema: {statements: statementsSchema},
  }),

  [api.fetchSentenceStatements]: (payload) => ({
    endpoint: `statements?sentenceType=${payload.sentenceType}&sentenceId=${payload.sentenceId}`,
    normalizationSchema: {statements: statementsSchema}
  }),
  [api.fetchRootPropositionStatements]: (payload) => ({
    endpoint: `statements?rootPropositionId=${payload.propositionId}`,
    normalizationSchema: {statements: statementsSchema}
  }),
  [api.fetchIndirectPropositionStatements]: (payload) => ({
    endpoint: `statements?rootPropositionId=${payload.propositionId}&indirect`,
    normalizationSchema: {statements: statementsSchema}
  }),

  /* Account */

  [api.createAccountSettings]: (payload) => ({
    endpoint: `account-settings`,
    fetchInit: {
      method: httpMethods.POST,
      body: payload
    },
  }),
  [api.fetchAccountSettings]: () => ({
    endpoint: `account-settings`,
    // TODO(98): replace rehydrate opt-ins with opt-out
    requiresRehydrate: true,
  }),
  [api.updateAccountSettings]: (payload) => ({
    endpoint: `account-settings`,
    fetchInit: {
      method: httpMethods.PUT,
      body: payload
    },
  }),

  /* Content Reports */

  [api.createContentReport]: (payload) => ({
    endpoint: `content-reports`,
    fetchInit: {
      method: httpMethods.POST,
      body: payload
    },
  }),

  /* Auth */

  [api.login]: (payload) => ({
    endpoint: 'login',
    fetchInit: {
      method: httpMethods.POST,
      body: payload,
    }
  }),
  [api.logout]: {
    endpoint: 'logout',
    fetchInit: {
      method: httpMethods.POST,
    }
  },
  [api.requestPasswordReset]: (payload) => ({
    endpoint: 'password-reset-requests',
    fetchInit: {
      method: httpMethods.POST,
      body: payload,
    }
  }),
  [api.checkPasswordResetRequest]: (payload) => {
    const queryStringParams = pick(payload, ['passwordResetCode'])
    const queryStringParamsString = queryString.stringify(queryStringParams)
    return {
      endpoint: `password-reset-requests?${queryStringParamsString}`,
    }
  },
  [api.confirmPasswordReset]: (payload) => ({
    endpoint: 'password-resets',
    fetchInit: {
      method: httpMethods.POST,
      body: payload,
    }
  }),
  [api.requestRegistration]: (payload) => ({
    endpoint: 'registration-requests',
    fetchInit: {
      method: httpMethods.POST,
      body: payload,
    }
  }),
  [api.checkRegistration]: (payload) => {
    const queryStringParams = pick(payload, ['registrationCode'])
    const queryStringParamsString = queryString.stringify(queryStringParams)
    return {
      endpoint: `registration-requests?${queryStringParamsString}`,
    }
  },
  [api.confirmRegistration]: (payload) => ({
    endpoint: 'registrations',
    fetchInit: {
      method: httpMethods.POST,
      body: payload,
    }
  }),

  /* Votes */

  [api.verifyJustification]: (payload) => ({
    endpoint: 'justification-votes',
    fetchInit: {
      method: httpMethods.POST,
      body: {
        justificationVote: payload.justificationVote
      }
    },
    normalizationSchema: {justificationVote: justificationVoteSchema},
  }),
  [api.unVerifyJustification]: (payload) => ({
    endpoint: 'justification-votes',
    fetchInit: {
      method: httpMethods.DELETE,
      body: {
        justificationVote: payload.justificationVote
      }
    },
  }),
  [api.disverifyJustification]: (payload) => ({
    endpoint: 'justification-votes',
    fetchInit: {
      method: httpMethods.POST,
      body: {
        justificationVote: payload.justificationVote
      }
    },
    normalizationSchema: {justificationVote: justificationVoteSchema},
  }),
  [api.unDisverifyJustification]: (payload) => ({
    endpoint: 'justification-votes',
    fetchInit: {
      method: httpMethods.DELETE,
      body: {
        justificationVote: payload.justificationVote
      }
    },
  }),

  [api.tagProposition]: (payload) => ({
    endpoint: 'proposition-tag-votes',
    fetchInit: {
      method: httpMethods.POST,
      body: {
        propositionTagVote: payload.propositionTagVote
      }
    },
    normalizationSchema: {propositionTagVote: propositionTagVoteSchema},
  }),
  [api.antiTagProposition]: (payload) => ({
    endpoint: 'proposition-tag-votes',
    fetchInit: {
      method: httpMethods.POST,
      body: {
        propositionTagVote: payload.propositionTagVote
      }
    },
    normalizationSchema: {propositionTagVote: propositionTagVoteSchema},
  }),
  [api.unTagProposition]: (payload) => ({
    endpoint: `proposition-tag-votes/${payload.prevPropositionTagVote.id}`,
    fetchInit: {
      method: httpMethods.DELETE,
    }
  }),

  /* Suggestions / full-text search */

  [api.fetchPropositionTextSuggestions]: (payload) => ({
    endpoint: `search-propositions?${queryString.stringify({searchText: payload.propositionText})}`,
    cancelKey: str(api.fetchPropositionTextSuggestions) + '.' + payload.suggestionsKey,
    normalizationSchema: propositionsSchema,
  }),
  [api.fetchTagNameSuggestions]: (payload) => ({
    endpoint: `search-tags?${queryString.stringify({searchText: payload.tagName})}`,
    cancelKey: str(api.fetchTagNameSuggestions) + '.' + payload.suggestionsKey,
    normalizationSchema: tagsSchema,
  }),
  [api.fetchWritTitleSuggestions]: (payload) => ({
    endpoint: `search-writs?${queryString.stringify({searchText: payload.writTitle})}`,
    cancelKey: str(api.fetchWritTitleSuggestions) + '.' + payload.suggestionsKey,
    normalizationSchema: writsSchema,
  }),
  [api.fetchPersorgNameSuggestions]: (payload) => ({
    endpoint: `search-persorgs?${queryString.stringify({searchText: payload.searchText})}`,
    cancelKey: `${api.fetchPersorgNameSuggestions}.${payload.suggestionsKey}`,
    normalizationSchema: persorgsSchema,
  }),

  [api.fetchMainSearchResults]: (payload) => ({
    endpoint: `search?${queryString.stringify({searchText: payload.searchText})}`,
    normalizationSchema: mainSearchResultsSchema,
  }),
  [api.fetchMainSearchSuggestions]: (payload) => ({
    endpoint: `search?${queryString.stringify({searchText: payload.searchText})}`,
    cancelKey: str(api.fetchMainSearchSuggestions) + '.' + payload.suggestionsKey,
    normalizationSchema: mainSearchResultsSchema,
  }),

  /* Justification search */

  [api.fetchJustificationsSearch]: (payload) => {
    const {
      filters,
      includeUrls,
      sorts,
      count,
      continuationToken
    } = payload
    const params = {}

    if (!isEmpty(filters)) {
      params.filters = encodeQueryStringObject(filters)
    }

    if (!isEmpty(includeUrls)) {
      params.includeUrls = includeUrls
    }

    if (!isEmpty(sorts)) {
      params.sorts = encodeQueryStringObject(sorts)
    } else {
      params.sorts = defaultSorts
    }

    if (count) {
      params.count = count
    }

    if (continuationToken) {
      params.continuationToken = continuationToken
    }

    return {
      endpoint: 'justifications?' + queryString.stringify(params),
      normalizationSchema: {justifications: justificationsSchema},
    }
  },
}
