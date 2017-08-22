import {combineActions, handleActions} from "redux-actions";
import get from 'lodash/get'
import union from 'lodash/union'

import {
  api,
  ui
} from '../actions'

const defaultRecentStatementsWidgetState = {recentStatements: [], continuationToken: null}
const defaultRecentCitationsWidgetState = {recentCitations: [], continuationToken: null}
const defaultRecentCitationReferencesWidgetState = {recentCitationReferences: [], continuationToken: null}
const defaultRecentJustificationsWidgetState = {recentJustifications: [], continuationToken: null}
export default handleActions({
  [api.fetchRecentStatements]: (state, action) => {
    const widgetId = action.payload.widgetId
    const widgetState = get(state, widgetId, defaultRecentStatementsWidgetState)
    const newWidgetState = {...widgetState, isFetching: true}
    return {...state, [widgetId]: newWidgetState}
  },
  [api.fetchRecentStatements.response]: {
    next: (state, action) => {
      const widgetId = action.meta.requestPayload.widgetId
      const widgetState = get(state, widgetId, defaultRecentStatementsWidgetState)
      const newWidgetState = {
        recentStatements: union(widgetState.recentStatements, action.payload.result.statements),
        continuationToken: action.payload.result.continuationToken,
        isFetching: false,
      }

      return {...state, [widgetId]: newWidgetState}
    },
    throw: (state, action) => {
      const widgetId = action.meta.requestPayload.widgetId
      const widgetState = get(state, widgetId, defaultRecentStatementsWidgetState)
      const newWidgetState = {...widgetState, isFetching: false, didError: true}
      return {...state, [widgetId]: newWidgetState}
    }
  },
  [api.fetchRecentCitations.response]: {
    next: (state, action) => {
      const widgetId = action.meta.requestPayload.widgetId
      const widgetState = get(state, widgetId, defaultRecentCitationsWidgetState)
      const newWidgetState = {
        recentCitations: union(widgetState.recentCitations, action.payload.result.citations),
        continuationToken: action.payload.result.continuationToken
      }

      return {...state, [widgetId]: newWidgetState, isFetching: false}
    },
  },
  [api.fetchRecentCitationReferences.response]: {
    next: (state, action) => {
      const widgetId = action.meta.requestPayload.widgetId
      const widgetState = get(state, widgetId, defaultRecentCitationReferencesWidgetState)
      const newWidgetState = {
        recentCitationReferences: union(widgetState.recentCitationReferences, action.payload.result.citationReferences),
        continuationToken: action.payload.result.continuationToken
      }

      return {...state, [widgetId]: newWidgetState, isFetching: false}
    },
  },
  [api.fetchRecentJustifications.response]: {
    next: (state, action) => {
      const widgetId = action.meta.requestPayload.widgetId
      const widgetState = get(state, widgetId, defaultRecentJustificationsWidgetState)
      const newWidgetState = {
        recentJustifications: union(widgetState.recentJustifications, action.payload.result.justifications),
        continuationToken: action.payload.result.continuationToken
      }

      return {...state, [widgetId]: newWidgetState, isFetching: false}
    },
  },
  [ui.clearRecentStatements]: (state, action) => {
    const widgetId = action.payload.widgetId
    const widgetState = get(state, widgetId)
    if (widgetState) {
      const newWidgetState = {...widgetState, ...defaultRecentStatementsWidgetState}
      return {...state, [widgetId]: newWidgetState}
    }
    return state
  },
  [ui.clearRecentCitations]: (state, action) => {
    const widgetId = action.payload.widgetId
    const widgetState = get(state, widgetId)
    if (widgetState) {
      const newWidgetState = {...widgetState, ...defaultRecentCitationsWidgetState}
      return {...state, [widgetId]: newWidgetState}
    }
    return state
  },
  [ui.clearRecentCitationReferences]: (state, action) => {
    const widgetId = action.payload.widgetId
    const widgetState = get(state, widgetId)
    if (widgetState) {
      const newWidgetState = {...widgetState, ...defaultRecentCitationReferencesWidgetState}
      return {...state, [widgetId]: newWidgetState}
    }
    return state
  },
  [ui.clearRecentJustifications]: (state, action) => {
    const widgetId = action.payload.widgetId
    const widgetState = get(state, widgetId)
    if (widgetState) {
      const newWidgetState = {...widgetState, ...defaultRecentJustificationsWidgetState}
      return {...state, [widgetId]: newWidgetState}
    }
    return state
  },
}, {})