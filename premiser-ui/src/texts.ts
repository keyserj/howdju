import isFunction from "lodash/isFunction";

import { isWindowNarrow } from "./util";

export const CREATE_PROPOSITION_SUBMIT_BUTTON_LABEL =
  "CREATE_PROPOSITION_SUBMIT_BUTTON_LABEL";
export const CREATE_PROPOSITION_SUBMIT_BUTTON_TITLE =
  "CREATE_PROPOSITION_BUTTON_TITLE";

export const CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL =
  "CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL";
export const CREATE_JUSTIFICATION_SUBMIT_BUTTON_TITLE =
  "CREATE_JUSTIFICATION_SUBMIT_BUTTON_TITLE";

export const CREATE_PROPOSITION_FAILURE_MESSAGE =
  "CREATE_PROPOSITION_FAILURE_MESSAGE";
export const CREATE_EXTANT_PROPOSITION_TOAST_MESSAGE =
  "CREATE_EXTANT_PROPOSITION_TOAST_MESSAGE";
export const DELETE_PROPOSITION_FAILURE_TOAST_MESSAGE =
  "DELETE_PROPOSITION_FAILURE_TOAST_MESSAGE";
export const DELETE_PROPOSITION_SUCCESS_TOAST_MESSAGE =
  "DELETE_PROPOSITION_SUCCESS_TOAST_MESSAGE";
export const MISSING_PROPOSITION_REDIRECT_TOAST_MESSAGE =
  "MISSING_PROPOSITION_REDIRECT_TOAST_MESSAGE";
export const MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE =
  "MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE";
export const FETCH_PROPOSITION_JUSTIFICATIONS_FAILURE_MESSAGE =
  "FETCH_PROPOSITION_JUSTIFICATIONS_FAILURE_MESSAGE";
export const LOGIN_SUCCESS_TOAST_MESSAGE = "LOGIN_SUCCESS_TOAST_MESSAGE";
export const CREATE_COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL =
  "CREATE_COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL";
export const CANCEL_BUTTON_LABEL = "CANCEL_BUTTON_LABEL";

export const COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL =
  "COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL";

export const CREATE_JUSTIFICATION_FAILURE_MESSAGE =
  "CREATE_JUSTIFICATION_FAILURE_MESSAGE";
export const CREATE_JUSTIFICATION_FAILURE_TOAST_MESSAGE =
  "CREATE_JUSTIFICATION_FAILURE_TOAST_MESSAGE";
export const DELETE_JUSTIFICATION_FAILURE_TOAST_MESSAGE =
  "DELETE_JUSTIFICATION_FAILURE_TOAST_MESSAGE";

export const VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE =
  "VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE";
export const UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE =
  "UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE";
export const DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE =
  "DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE";
export const UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE =
  "UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE";

export const JUSTIFICATION_POLARITY_POSITIVE =
  "JUSTIFICATION_POLARITY_POSITIVE";
export const JUSTIFICATION_POLARITY_NEGATIVE =
  "JUSTIFICATION_POLARITY_NEGATIVE";
export const JUSTIFICATION_BASIS_TYPE_PROPOSITION_COMPOUND =
  "JUSTIFICATION_BASIS_TYPE_PROPOSITION_COMPOUND";
export const JUSTIFICATION_BASIS_TYPE_WRIT_QUOTE =
  "JUSTIFICATION_BASIS_TYPE_WRIT_QUOTE";
export const ADD_JUSTIFICATION_CALL_TO_ACTION =
  "ADD_JUSTIFICATION_CALL_TO_ACTION";
export const JUSTIFICATION_BASIS_TYPE_JUSTIFICATION_BASIS_COMPOUND =
  "JUSTIFICATION_BASIS_TYPE_JUSTIFICATION_BASIS_COMPOUND";

export const ADD_JUSTIFICATION_TO_CREATE_PROPOSITION =
  "ADD_JUSTIFICATION_TO_CREATE_PROPOSITION";

export const YOU_LACK_PERMISSION_TO_PERFORM_THAT_ACTION =
  "YOU_LACK_PERMISSION_TO_PERFORM_THAT_ACTION";

export const ERROR_FETCHING_PROPOSITION = "ERROR_FETCHING_PROPOSITION";
export const ERROR_UPDATING_PROPOSITION = "ERROR_UPDATING_PROPOSITION";
export const ERROR_CREATING_PROPOSITION = "ERROR_CREATING_PROPOSITION";

export const CREATE_PROPOSITION_TITLE = "CREATE_PROPOSITION_TITLE";
export const CREATE_JUSTIFICATION_TITLE = "CREATE_JUSTIFICATION_TITLE";
export const EDIT_JUSTIFICATION_TITLE = "EDIT_JUSTIFICATION_TITLE";

export const EDIT_JUSTIFICATION_SUBMIT_BUTTON_LABEL =
  "EDIT_JUSTIFICATION_SUBMIT_BUTTON_LABEL";

export const CREATE_ENTITY_SUBMIT_BUTTON_LABEL =
  "CREATE_ENTITY_SUBMIT_BUTTON_LABEL";
export const EDIT_ENTITY_BUTTON_LABEL = "EDIT_ENTITY_BUTTON_LABEL";
export const EDIT_ENTITY_SUBMIT_BUTTON_LABEL =
  "EDIT_ENTITY_SUBMIT_BUTTON_LABEL";

export const LOGIN_TO_CONTINUE = "LOGIN_TO_CONTINUE";
export const YOU_HAVE_BEEN_LOGGED_OUT = "YOU_HAVE_BEEN_LOGGED_OUT";

export const JUSTIFICATION_TITLE = "JUSTIFICATION_TITLE";

export const AN_UNEXPECTED_ERROR_OCCURRED = "AN_UNEXPECTED_ERROR_OCCURRED";

export const A_NETWORK_ERROR_OCCURRED = "A_NETWORK_ERROR_OCCURRED";

export const THAT_PROPOSITION_ALREADY_EXISTS =
  "THAT_PROPOSITION_ALREADY_EXISTS";
export const THAT_STATEMENT_ALREADY_EXISTS = "THAT_STATEMENT_ALREADY_EXISTS";
export const THAT_JUSTIFICATION_ALREADY_EXISTS =
  "THAT_JUSTIFICATION_ALREADY_EXISTS";

export const INVALID_LOGIN_CREDENTIALS = "INVALID_LOGIN_CREDENTIALS";
export const USER_IS_INACTIVE_ERROR = "USER_IS_INACTIVE_ERROR";
export const UNABLE_TO_LOGIN = "UNABLE_TO_LOGIN";

export const MAIN_TABS_RECENT_ACTIVITY_TAB_NAME =
  "MAIN_TABS_RECENT_ACTIVITY_TAB_NAME";
export const MAIN_TABS_WHATS_NEXT_TAB_NAME = "MAIN_TABS_WHATS_NEXT_TAB_NAME";
export const MAIN_TABS_ABOUT_TAB_NAME = "MAIN_TABS_ABOUT_TAB_NAME";

export const YOU_ARE_LOGGED_IN_AS = "YOU_ARE_LOGGED_IN_AS";

const translations = {
  [CREATE_PROPOSITION_SUBMIT_BUTTON_LABEL]: "Create proposition",
  [CREATE_PROPOSITION_SUBMIT_BUTTON_TITLE]: "Tell the world!",

  [CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: "Create justification",
  [CREATE_JUSTIFICATION_SUBMIT_BUTTON_TITLE]:
    "A proposition is only as good as its justification",

  [THAT_PROPOSITION_ALREADY_EXISTS]: "That proposition already exists",
  [THAT_STATEMENT_ALREADY_EXISTS]: "That statement already exists",
  [THAT_JUSTIFICATION_ALREADY_EXISTS]: "That justification already exists",
  [CREATE_PROPOSITION_FAILURE_MESSAGE]: "Unable to create the proposition",
  [DELETE_PROPOSITION_FAILURE_TOAST_MESSAGE]:
    "Unable to delete the proposition",
  [DELETE_PROPOSITION_SUCCESS_TOAST_MESSAGE]: "Deleted the proposition",
  [FETCH_PROPOSITION_JUSTIFICATIONS_FAILURE_MESSAGE]:
    "Unable to load proposition's justifications",
  [LOGIN_SUCCESS_TOAST_MESSAGE]: (email: string) =>
    `You have logged in as ${email}`,
  [MISSING_PROPOSITION_REDIRECT_TOAST_MESSAGE]:
    "Could not find that proposition",
  [MISSING_STATEMENT_REDIRECT_TOAST_MESSAGE]: "Could not find that statement",
  [VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: "Verification failed.",
  [UN_VERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]:
    "Removing verification failed.",
  [DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]: "Disverification failed.",
  [UN_DISVERIFY_JUSTIFICATION_FAILURE_TOAST_MESSAGE]:
    "Removing disverification failed.",
  [CANCEL_BUTTON_LABEL]: "Cancel",
  [JUSTIFICATION_POLARITY_POSITIVE]: "Supporting",
  [JUSTIFICATION_POLARITY_NEGATIVE]: "Opposing",
  [JUSTIFICATION_BASIS_TYPE_PROPOSITION_COMPOUND]: "Proposition(s)",
  [JUSTIFICATION_BASIS_TYPE_WRIT_QUOTE]: "Quote",
  [JUSTIFICATION_BASIS_TYPE_JUSTIFICATION_BASIS_COMPOUND]:
    "Source excerpt paraphrase",

  [CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: "Create",
  [CREATE_COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: "Counter",
  [CREATE_JUSTIFICATION_FAILURE_MESSAGE]: "Unable to create justification",
  [CREATE_JUSTIFICATION_FAILURE_TOAST_MESSAGE]:
    "Unable to create justification",
  [DELETE_JUSTIFICATION_FAILURE_TOAST_MESSAGE]:
    "Unable to delete justification",
  [ADD_JUSTIFICATION_CALL_TO_ACTION]: "Add one now",
  [ADD_JUSTIFICATION_TO_CREATE_PROPOSITION]: "Create justification",
  [YOU_LACK_PERMISSION_TO_PERFORM_THAT_ACTION]:
    "You lack permission to perform that action",

  [CREATE_PROPOSITION_TITLE]: "Create proposition",
  [CREATE_JUSTIFICATION_TITLE]: "Justify proposition",
  [EDIT_JUSTIFICATION_TITLE]: "Edit justification",

  [ERROR_FETCHING_PROPOSITION]: "Error fetching proposition",
  [ERROR_UPDATING_PROPOSITION]: "Error updating proposition",
  [ERROR_CREATING_PROPOSITION]: "Error creating proposition",

  [EDIT_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: "Save",

  [CREATE_ENTITY_SUBMIT_BUTTON_LABEL]: "Create",

  [EDIT_ENTITY_BUTTON_LABEL]: "Edit",
  [EDIT_ENTITY_SUBMIT_BUTTON_LABEL]: "Save",

  [LOGIN_TO_CONTINUE]: "Login to continue",
  [YOU_HAVE_BEEN_LOGGED_OUT]: "You have been logged out.",

  [JUSTIFICATION_TITLE]: "Justification",
  [AN_UNEXPECTED_ERROR_OCCURRED]: "An unexpected error occurred.",
  [A_NETWORK_ERROR_OCCURRED]:
    "A network error occurred.  Please check your connection and try again.",
  [COUNTER_JUSTIFICATION_SUBMIT_BUTTON_LABEL]: "Counter",

  [INVALID_LOGIN_CREDENTIALS]: "Invalid login credentials",
  [USER_IS_INACTIVE_ERROR]:
    "The account is currently inactive.  Please contact support.",
  [UNABLE_TO_LOGIN]: "Unable to login",

  [MAIN_TABS_RECENT_ACTIVITY_TAB_NAME]: () =>
    isWindowNarrow() ? "Recent" : "Recent activity",
  [MAIN_TABS_WHATS_NEXT_TAB_NAME]: () =>
    isWindowNarrow() ? "Next" : "What's next",
  [MAIN_TABS_ABOUT_TAB_NAME]: "About",

  [YOU_ARE_LOGGED_IN_AS]: (email: string) => `You are logged in as ${email}`,
} as const;

type TranslationKey = keyof typeof translations;

const text = (key: TranslationKey | string, ...args: any[]) => {
  if (!(key in translations)) {
    return key;
  }
  const t = translations[key as TranslationKey];
  if (isFunction(t)) {
    return t(...(args as [any]));
  }
  return t;
};

export default text;
