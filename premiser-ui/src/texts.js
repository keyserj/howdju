import {logError} from "./util";
import isFunction from 'lodash/isFunction'

export const CREATE_STATEMENT_SUBMIT_BUTTON_LABEL = 'CREATE_STATEMENT_SUBMIT_BUTTON_LABEL'
export const CREATE_STATEMENT_SUBMIT_BUTTON_TITLE = 'CREATE_STATEMENT_BUTTON_TITLE'

export const CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL = 'CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL'
export const CREATE_JUSTIFICATION_SUBMIT_BUTTON_TITLE = 'CREATE_JUSTIFICATION_SUBMIT_BUTTON_TITLE'

export const CREATE_STATEMENT_FAILURE_MESSAGE = 'CREATE_STATEMENT_FAILURE_MESSAGE'
export const CREATE_EXTANT_STATEMENT_TOAST_MESSAGE = 'CREATE_EXTANT_STATEMENT_TOAST_MESSAGE'
export const DELETE_STATEMENT_FAILURE_TOAST_MESSAGE = 'DELETE_STATEMENT_FAILURE_TOAST_MESSAGE'
export const DELETE_STATEMENT_SUCCESS_TOAST_MESSAGE = 'DELETE_STATEMENT_SUCCESS_TOAST_MESSAGE'
export const MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE = 'MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE'
export const FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE = 'FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE'
export const LOGIN_SUCCESS_TOAST_MESSAGE = 'LOGIN_SUCCESS_TOAST_MESSAGE'
export const CREATE_COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL = 'CREATE_COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL'
export const CANCEL_BUTTON_LABEL = 'CANCEL_BUTTON_LABEL'

export const CREATE_JUSTIFICATION_FAILURE_MESSAGE = 'CREATE_JUSTIFICATION_FAILURE_MESSAGE'
export const CREATE_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'CREATE_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const DELETE_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'DELETE_JUSTIFICATION_FAILURE_TOAST_MESSAGE'

export const VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'
export const UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE = 'UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE'

export const JUSTIFICATION_POLARITY_POSITIVE = 'JUSTIFICATION_POLARITY_POSITIVE'
export const JUSTIFICATION_POLARITY_NEGATIVE = 'JUSTIFICATION_POLARITY_NEGATIVE'
export const JUSTIFICATION_BASIS_TYPE_STATEMENT = 'JUSTIFICATION_BASIS_TYPE_STATEMENT'
export const JUSTIFICATION_BASIS_TYPE_CITATION_REFERENCE = 'JUSTIFICATION_BASIS_TYPE_CITATION_REFERENCE'
export const ADD_JUSTIFICATION_CALL_TO_ACTION = 'ADD_JUSTIFICATION_CALL_TO_ACTION'

export const ADD_JUSTIFICATION_TO_CREATE_STATEMENT = 'ADD_JUSTIFICATION_TO_CREATE_STATEMENT'

export const YOU_LACK_PERMISSION_TO_PERFORM_THAT_ACTION = 'YOU_LACK_PERMISSION_TO_PERFORM_THAT_ACTION'
export const A_STATEMENT_WITH_THAT_TEXT_ALREADY_EXISTS = 'A_STATEMENT_WITH_THAT_TEXT_ALREADY_EXISTS'
export const CANNOT_MODIFY_A_STATEMENT_AFTER_OTHER_USERS_HAVE_ADDED_JUSTIFICATIONS_OR_VERIFIED_IT = 'CANNOT_MODIFY_A_STATEMENT_AFTER_OTHER_USERS_HAVE_ADDED_JUSTIFICATIONS_OR_VERIFIED_IT'

export const ERROR_FETCHING_STATEMENT = 'ERROR_FETCHING_STATEMENT'
export const ERROR_UPDATING_STATEMENT = 'ERROR_UPDATING_STATEMENT'
export const ERROR_CREATING_STATEMENT = 'ERROR_CREATING_STATEMENT'

export const CREATE_STATEMENT_TITLE = 'CREATE_STATEMENT_TITLE'
export const CREATE_JUSTIFICATION_TITLE = 'CREATE_JUSTIFICATION_TITLE'
export const EDIT_JUSTIFICATION_TITLE = 'EDIT_JUSTIFICATION_TITLE'

export const EDIT_JUSTIFICATION_SUBMIT_BUTTON_LABEL = 'EDIT_JUSTIFICATION_SUBMIT_BUTTON_LABEL'

export const OTHER_USERS_HAVE_VOTED_ON_JUSTIFICATIONS_USING_THIS_CITATION_REFERENCE = 'OTHER_USERS_HAVE_VOTED_ON_JUSTIFICATIONS_USING_THIS_CITATION_REFERENCE'
export const OTHER_USERS_HAVE_CREATED_JUSTIFICATIONS_BASED_UPON_THIS_CITATION_REFERENCE = 'OTHER_USERS_HAVE_CREATED_JUSTIFICATIONS_BASED_UPON_THIS_CITATION_REFERENCE'
export const OTHER_USERS_HAVE_COUNTERED_JUSTIFICATIONS_BASED_UPON_THIS_CITATION_REFERENCE = 'OTHER_USERS_HAVE_COUNTERED_JUSTIFICATIONS_BASED_UPON_THIS_CITATION_REFERENCE'

export const EDIT_STATEMENT_SUBMIT_BUTTON_LABEL = 'EDIT_STATEMENT_SUBMIT_BUTTON_LABEL'

export const LOGIN_TO_CONTINUE = 'LOGIN_TO_CONTINUE'

export const JUSTIFICATION_TITLE = 'JUSTIFICATION_TITLE'

const texts = {
  [CREATE_STATEMENT_SUBMIT_BUTTON_LABEL]: 'Create statement',
  [CREATE_STATEMENT_SUBMIT_BUTTON_TITLE]: 'Tell the world!',

  [CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: 'Create justification',
  [CREATE_JUSTIFICATION_SUBMIT_BUTTON_TITLE]: 'A statement is only as good as its justification',

  [CREATE_EXTANT_STATEMENT_TOAST_MESSAGE]: 'That statement already exists',
  [CREATE_STATEMENT_FAILURE_MESSAGE]: 'Unable to create the statement',
  [DELETE_STATEMENT_FAILURE_TOAST_MESSAGE]: 'Unable to delete the statement',
  [DELETE_STATEMENT_SUCCESS_TOAST_MESSAGE]: 'Deleted the statement',
  [FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE]: "Unable to load statement's justifications",
  [LOGIN_SUCCESS_TOAST_MESSAGE]: email => `You have logged in as ${email}`,
  [MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE]: 'Could not find that statement',
  [VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Verification failed.',
  [UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Removing verification failed.',
  [DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Disverification failed.',
  [UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Removing disverification failed.',
  [CANCEL_BUTTON_LABEL]: 'Cancel',
  [JUSTIFICATION_POLARITY_POSITIVE]: 'Positive',
  [JUSTIFICATION_POLARITY_NEGATIVE]: 'Negative',
  [JUSTIFICATION_BASIS_TYPE_STATEMENT]: 'Statement',
  [JUSTIFICATION_BASIS_TYPE_CITATION_REFERENCE]: 'Quote',

  [CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: 'Create',
  [CREATE_COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: 'Counter',
  [CREATE_JUSTIFICATION_FAILURE_MESSAGE]: 'Unable to create justification',
  [CREATE_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Unable to create justification',
  [DELETE_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: 'Unable to delete justification',
  [ADD_JUSTIFICATION_CALL_TO_ACTION]: 'Add one now',
  [ADD_JUSTIFICATION_TO_CREATE_STATEMENT]: 'Create justification',
  [YOU_LACK_PERMISSION_TO_PERFORM_THAT_ACTION]: 'You lack permission to perform that action',
  [A_STATEMENT_WITH_THAT_TEXT_ALREADY_EXISTS]: 'A statement with that text already exists',
  [CANNOT_MODIFY_A_STATEMENT_AFTER_OTHER_USERS_HAVE_ADDED_JUSTIFICATIONS_OR_VERIFIED_IT]:
    'Cannot modify a statement after other users have added justifications to or verified it',

  [CREATE_STATEMENT_TITLE]: 'Create statement',
  [CREATE_JUSTIFICATION_TITLE]: 'Justify statement',
  [EDIT_JUSTIFICATION_TITLE]: 'Edit justification',

  [ERROR_FETCHING_STATEMENT]: 'Error fetching statement',
  [ERROR_UPDATING_STATEMENT]: 'Error updating statement',
  [ERROR_CREATING_STATEMENT]: 'Error creating statement',

  [EDIT_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: 'Save',

  [OTHER_USERS_HAVE_VOTED_ON_JUSTIFICATIONS_USING_THIS_CITATION_REFERENCE]: 'Other users have voted on justifications using this citation reference',
  [OTHER_USERS_HAVE_CREATED_JUSTIFICATIONS_BASED_UPON_THIS_CITATION_REFERENCE]: 'Other users have created justifications based upon this citation reference',
  [OTHER_USERS_HAVE_COUNTERED_JUSTIFICATIONS_BASED_UPON_THIS_CITATION_REFERENCE]: 'Other users have countered justifications based upon this citation reference',

  [EDIT_STATEMENT_SUBMIT_BUTTON_LABEL]: 'Save',

  [LOGIN_TO_CONTINUE]: 'Login to continue',

  [JUSTIFICATION_TITLE]: 'Justification',
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