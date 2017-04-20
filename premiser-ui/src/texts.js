import {logError} from "./util";
import isFunction from 'lodash/isFunction'

export const CREATE_STATEMENT_SUBMIT_BUTTON_LABEL = 'CREATE_STATEMENT_SUBMIT_BUTTON_LABEL'
export const CREATE_STATEMENT_SUBMIT_BUTTON_TITLE = 'CREATE_STATEMENT_BUTTON_TITLE'
export const CREATE_STATEMENT_FAILURE_MESSAGE = 'CREATE_STATEMENT_FAILURE_MESSAGE'
export const CREATE_EXTANT_STATEMENT_TOAST_MESSAGE = 'CREATE_EXTANT_STATEMENT_TOAST_MESSAGE'
export const DELETE_STATEMENT_FAILURE_TOAST_MESSAGE = 'DELETE_STATEMENT_FAILURE_TOAST_MESSAGE'
export const DELETE_STATEMENT_SUCCESS_TOAST_MESSAGE = 'DELETE_STATEMENT_SUCCESS_TOAST_MESSAGE'
export const MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE = 'MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE'
export const FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE = 'FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE'
export const LOGIN_SUCCESS_TOAST_MESSAGE = 'LOGIN_SUCCESS_TOAST_MESSAGE'


export const VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'

const texts = {
  [CREATE_STATEMENT_SUBMIT_BUTTON_LABEL]: 'Create statement',
  [CREATE_STATEMENT_SUBMIT_BUTTON_TITLE]: 'Tell the world!',
  [CREATE_EXTANT_STATEMENT_TOAST_MESSAGE]: 'That statement already exists',
  [CREATE_STATEMENT_FAILURE_MESSAGE]: 'Unable to create the statement',
  [DELETE_STATEMENT_FAILURE_TOAST_MESSAGE]: 'Unable to delete the statement',
  [DELETE_STATEMENT_SUCCESS_TOAST_MESSAGE]: 'Deleted the statement',
  [FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE]: 'Unable to load justifications',
  [LOGIN_SUCCESS_TOAST_MESSAGE]: email => `You have logged in as ${email}`,
  [MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE]: 'Could not find that statement',
  [VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Verification failed.',
  [UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Removing verification failed.',
  [DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Disverification failed.',
  [UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Removing disverification failed.',
}

const text = (key, ...args) => {
  const t = texts[key]
  if (!t) {
    logError(`No text key: ${key}`)
    return '';
  }
  return isFunction(t) ? t(...args) : t
}

export default text