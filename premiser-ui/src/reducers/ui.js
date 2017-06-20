import { combineReducers } from 'redux'
import {LOCATION_CHANGE} from 'react-router-redux'
import {handleActions} from "redux-actions";

import {
  api,
  ui
} from '../actions'
import text, {CREATE_JUSTIFICATION_FAILURE_MESSAGE} from "../texts";
import mainSearcher from '../mainSearcher'


const loginErrorMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid credentials'
    case 403:
      return 'Incorrect password'
    case 404:
      return 'Email does not exist'
    default:
      return 'Unable to complete login at this time'
  }
}

const loginPage = handleActions({
  [api.login]: (state, action) => ({...state, isLoggingIn: true}),
  [api.login.response]: {
    next: state => ({...state, isLoggingIn: false}),
    throw: (state, action) => ({...state, isLoggingIn: false})
  },
}, {
  isLoggingIn: false,
})

const statementJustificationsPage = handleActions({
  [ui.showNewJustificationDialog]: (state, action) => ({
    ...state,
    isNewJustificationDialogVisible: true,
  }),
  [ui.hideNewJustificationDialog]: (state, action) => ({...state, isNewJustificationDialogVisible: false}),
}, {
  isNewJustificationDialogVisible: false,
})

export const appUi = handleActions({
  [ui.showNavDrawer]: (state, action) => ({...state, isNavDrawerVisible: true}),
  [ui.hideNavDrawer]: (state, action) => ({...state, isNavDrawerVisible: false}),
  [ui.toggleNavDrawerVisibility]: (state, action) => ({...state, isNavDrawerVisible: !state.isNavDrawerVisible}),
  [ui.setNavDrawerVisibility]: (state, action) => ({...state, isNavDrawerVisible: action.payload.visible}),
  [ui.addToast]: (state, action) => ({...state, toasts: state.toasts.concat(action.payload)}),
  [ui.dismissToast]: (state, action) => ({...state, toasts: state.toasts.slice(1)}),
}, {
  isNavDrawerVisible: false,
  toasts: []
})

export const mainSearch = handleActions({
  [ui.mainSearchTextChange]: (state, action) => ({...state, mainSearchText: action.payload}),
  [LOCATION_CHANGE]: (state, action) => {
    if (!mainSearcher.isSearch(action.payload)) {
      return {...state, mainSearchText: ''}
    }
    return state
  },
}, {
  mainSearchText: '',
})

export const mainSearchPage = handleActions({
  [api.fetchStatementsSearch]: (state, action) => ({...state, isFetching: true}),
  [api.fetchStatementsSearch.response]: {
    next: (state, action) => {
      const statements = action.payload.result.map(id => action.payload.entities.statements[id])
      return {...state, isFetching: false, statements: statements || []}
    },
    throw: (state, action) => ({...state, isFetching: false})
  }
}, {
  isFetching: false,
  statements: []
})

export default combineReducers({
  loginPage,
  statementJustificationsPage,
  mainSearchPage,
  app: appUi,
  mainSearch,
})
