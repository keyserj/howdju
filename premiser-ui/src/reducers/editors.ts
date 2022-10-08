import { AnyAction } from "redux";
import {
  Action,
  ActionMeta,
  handleActions,
  ReduxCompatibleReducerMeta,
} from "redux-actions";
import assign from "lodash/assign";
import clone from "lodash/clone";
import cloneDeep from "lodash/cloneDeep";
import concat from "lodash/concat";
import difference from "lodash/difference";
import find from "lodash/find";
import forEach from "lodash/forEach";
import get from "lodash/get";
import has from "lodash/has";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import includes from "lodash/includes";
import merge from "lodash/merge";
import set from "lodash/set";

import {
  apiErrorCodes,
  insertAt,
  JustificationRootTargetTypes,
  makeNewPropositionAtom,
  makeNewJustificationBasisCompoundAtom,
  makeNewPersorg,
  makeNewUrl,
  newProgrammingError,
  removeAt,
  makePropositionTagVote,
  PropositionTagVotePolarities,
  tagEqual,
  Entity,
  ApiErrorCode,
  Url,
  Persorg,
  Proposition,
  PropositionTagVotePolarity,
  OneOf,
  SourceExcerptParaphrase,
  JustificationBasisCompoundAtomType,
  WritQuote,
  RecursiveObject,
} from "howdju-common";

import {
  api,
  EditorActionCreator,
  EditorCommitActionCreator,
  editors,
  ListPathFactory,
  str,
} from "@/actions";
import { UiErrorType, uiErrorTypes } from "@/uiErrors";
import {
  INVALID_LOGIN_CREDENTIALS,
  UNABLE_TO_LOGIN,
  USER_IS_INACTIVE_ERROR,
} from "@/texts";
import { logger } from "@/logger";
import { EditorId, EntityFactory, PropertyChanges } from "@/types";

type BooleanObject = { [key: string]: boolean };
const EditorActions: BooleanObject = {};
forEach(
  editors as { [key: string]: EditorActionCreator | EditorCommitActionCreator },
  (actionCreator: EditorActionCreator | EditorCommitActionCreator) => {
    EditorActions[str(actionCreator)] = true;
    // Include the result action too, if present
    if ("result" in actionCreator) {
      EditorActions[str(actionCreator.result)] = true;
    }
  }
);

export const EditorTypes = {
  DEFAULT: "DEFAULT",
  PROPOSITION: "PROPOSITION",
  PROPOSITION_COMPOUND: "PROPOSITION_COMPOUND",
  JUSTIFICATION_BASIS_COMPOUND: "JUSTIFICATION_BASIS_COMPOUND",
  WRIT_QUOTE: "WRIT_QUOTE",
  COUNTER_JUSTIFICATION: "COUNTER_JUSTIFICATION",
  /* e.g. new justification dialog */
  NEW_JUSTIFICATION: "NEW_JUSTIFICATION",
  /* e.g. Proposition justification page */
  PROPOSITION_JUSTIFICATION: "PROPOSITION_JUSTIFICATION",
  LOGIN_CREDENTIALS: "LOGIN_CREDENTIALS",
  REGISTRATION_REQUEST: "REGISTRATION_REQUEST",
  REGISTRATION_CONFIRMATION: "REGISTRATION_CONFIRMATION",
  PERSORG: "PERSORG",
  ACCOUNT_SETTINGS: "ACCOUNT_SETTINGS",
  CONTENT_REPORT: "CONTENT_REPORT",
} as const;
export type EditorType = typeof EditorTypes[keyof typeof EditorTypes];

export const EntityTypeDescriptions = {
  [EditorTypes.WRIT_QUOTE]: "WritQuote",
};

export type EditorFieldsErrors = RecursiveObject<string>;
type ApiFieldsErrors = RecursiveObject<string>;
export type DirtyFields = RecursiveObject<boolean>;

interface JustificationEditEntity extends Entity {
  basis: {
    writQuote: {
      urls: Url[];
    };
    propositionCompound: {
      atoms: Array<{
        entity: Proposition;
      }>;
    };
    justificationBasisCompound: {
      atoms: Array<
        {
          type: JustificationBasisCompoundAtomType;
        } & OneOf<{
          proposition: Proposition;
          sourceExcerptParaphrase: SourceExcerptParaphrase;
        }>
      >;
    };
  };
}

interface PropositionJustificationsEditEntity extends Entity {
  proposition: Proposition;
  speakers: Persorg[];
  newJustification: JustificationEditEntity;
}

interface EditorState {
  editEntity:
    | Entity
    | JustificationEditEntity
    | PropositionJustificationsEditEntity
    | WritQuote
    | null;
  errors: EditorFieldsErrors | null;
  isSaving: boolean;
  isSaved: boolean;
  dirtyFields: DirtyFields;
  wasSubmitAttempted: boolean;
}

const defaultEditorState: EditorState = {
  editEntity: null,
  errors: null,
  isSaving: false,
  isSaved: false,
  dirtyFields: {},
  wasSubmitAttempted: false,
};

interface ErrorPayload {
  sourceError: {
    errorType: UiErrorType;
    body: {
      errorCode: ApiErrorCode;
      errors: ApiFieldsErrors;
    };
  };
}

export interface AddListItemPayload {
  editorType: EditorType;
  editorId: EditorId;
  itemIndex: number;
  listPathMaker: ListPathFactory;
  itemFactory: () => Entity;
}

const editorErrorReducer =
  (errorKey: string) => (state: EditorState, action: Action<ErrorPayload>) => {
    const sourceError = action.payload.sourceError;
    if (sourceError.errorType !== uiErrorTypes.API_RESPONSE_ERROR) {
      return state;
    }
    const responseBody = sourceError.body;
    if (
      !responseBody ||
      !includes(
        [
          apiErrorCodes.VALIDATION_ERROR,
          apiErrorCodes.ENTITY_CONFLICT,
          apiErrorCodes.USER_ACTIONS_CONFLICT,
          apiErrorCodes.AUTHORIZATION_ERROR,
        ],
        responseBody.errorCode
      )
    ) {
      return state;
    }
    const errors = responseBody.errors[errorKey] as EditorFieldsErrors;
    return { ...state, errors, isSaving: false };
  };

// TODO(#83): replace bespoke list reducers with addListItem/removeListItem
const makeAddAtomReducer =
  (atomsPath: string, atomMaker: EntityFactory) =>
  (state: EditorState, action: AnyAction) => {
    const editEntity = { ...state.editEntity };
    const atoms = clone(get(editEntity, atomsPath));
    const index = isNumber(action.payload.index)
      ? action.payload.index
      : atoms.length;
    insertAt(atoms, index, atomMaker());
    set(editEntity, atomsPath, atoms);
    return { ...state, editEntity };
  };

const makeRemoveAtomReducer =
  (atomsPath: string) => (state: EditorState, action: AnyAction) => {
    const editEntity = { ...state.editEntity };
    const atoms = clone(get(editEntity, atomsPath));
    removeAt(atoms, action.payload.index);
    set(editEntity, atomsPath, atoms);
    return { ...state, editEntity };
  };

/** Accepts a payload and returns something suitable to pass to lodash's second `get` argument. */
type PathFactory = (payload: any) => string | (string | number)[];

const makeAddUrlReducer =
  (urlsPathMaker: PathFactory) => (state: EditorState, action: AnyAction) => {
    const { urlIndex } = action.payload;
    const editEntity = { ...state.editEntity };

    const urlsPath = urlsPathMaker(action.payload);
    const urls = clone(get(editEntity, urlsPath));
    const insertIndex = isNumber(urlIndex) ? urlIndex : urls.length;
    insertAt(urls, insertIndex, makeNewUrl());
    set(editEntity, urlsPath, urls);
    return { ...state, editEntity };
  };

const makeRemoveUrlReducer =
  (urlsPathMaker: PathFactory) => (state: EditorState, action: AnyAction) => {
    const { urlIndex } = action.payload;
    const editEntity = { ...state.editEntity };

    const urlsPath = urlsPathMaker(action.payload);
    const urls = clone(get(editEntity, urlsPath));
    removeAt(urls, urlIndex);
    set(editEntity, urlsPath, urls);
    return { ...state, editEntity };
  };

/** Reducers that separate the behavior from the state so that it is possible to have independent states updating according
 * to the same rules.  The editor type determines the rules that update the state, the editor type and editor ID identify
 * the state.
 */
const defaultEditorActions = {
  [str(editors.beginEdit)]: (state: EditorState, action: AnyAction) => {
    const { entity } = action.payload;
    const editEntity = cloneDeep(entity);
    return { ...state, editEntity, errors: null };
  },
  [str(editors.propertyChange)]: (
    state: EditorState,
    action: Action<PropertyChanges>
  ) => {
    if (!state.editEntity) {
      return state;
    }
    const editEntity = cloneDeep(state.editEntity);
    const properties = action.payload.properties;
    const newDirtyFields: DirtyFields = {};
    forEach(properties, (val, key) => {
      set(editEntity, key, val);
      newDirtyFields[key] = true;
    });
    const dirtyFields = { ...state.dirtyFields, ...newDirtyFields };
    return { ...state, editEntity, dirtyFields };
  },
  [str(editors.addListItem)]: (
    state: EditorState,
    action: Action<AddListItemPayload>
  ) => {
    const { itemIndex, listPathMaker, itemFactory } = action.payload;
    const editEntity = { ...state.editEntity };

    const listPath = isString(listPathMaker)
      ? listPathMaker
      : listPathMaker(action.payload);
    const list = clone(get(editEntity, listPath));
    const insertIndex = isNumber(itemIndex) ? itemIndex : list.length;
    insertAt(list, insertIndex, itemFactory());
    set(editEntity, listPath, list);
    return { ...state, editEntity };
  },
  [str(editors.removeListItem)]: (state: EditorState, action: AnyAction) => {
    const { itemIndex, listPathMaker } = action.payload;
    const editEntity = { ...state.editEntity };

    const listPath = isString(listPathMaker)
      ? listPathMaker
      : listPathMaker(action.payload);
    const list = clone(get(editEntity, listPath));
    removeAt(list, itemIndex);
    set(editEntity, listPath, list);
    return { ...state, editEntity };
  },
  [str(editors.commitEdit)]: (state: EditorState) => ({
    ...state,
    isSaving: true,
    errors: null,
    wasSubmitAttempted: true,
  }),
  [str(editors.commitEdit.result)]: {
    next: (state: EditorState) => ({
      ...state,
      isSaving: false,
      editEntity: null,
      dirtyFields: {},
    }),
    throw: (state: EditorState, action: Action<ErrorPayload>) => {
      const sourceError = action.payload.sourceError;
      if (sourceError.errorType === uiErrorTypes.API_RESPONSE_ERROR) {
        const responseBody = sourceError.body;
        if (get(responseBody, "errorCode") === apiErrorCodes.VALIDATION_ERROR) {
          return { ...state, isSaving: false, errors: responseBody.errors };
        }
      }

      return { ...state, isSaving: false };
    },
  },
  [str(editors.cancelEdit)]: (state: EditorState) => ({
    ...state,
    editEntity: null,
    dirtyFields: {},
  }),
};

interface EditorMeta {
  requestPayload?: any;
}
const defaultEditorReducer = handleActions<EditorState, any>(
  defaultEditorActions,
  defaultEditorState
);
const editorReducerByType: {
  [key in EditorType]+?: ReduxCompatibleReducerMeta<
    EditorState,
    any,
    EditorMeta
  >;
} = {
  [EditorTypes.DEFAULT]: defaultEditorReducer,

  // TODO(94): adopt Redux's slice pattern to get precise reducer typechecking
  [EditorTypes.PROPOSITION]: handleActions<EditorState, any, EditorMeta>(
    {
      [str(api.fetchRootJustificationTarget)]: (state, action) => {
        const { rootTargetType, rootTargetId } = action.payload;
        const propositionId = get(state, "editEntity.id");
        if (
          rootTargetType === JustificationRootTargetTypes.PROPOSITION &&
          propositionId === rootTargetId
        ) {
          return { ...state, isFetching: true };
        }
        return state;
      },
      [str(api.fetchProposition)]: (state, action) => {
        const propositionId = get(state, "editEntity.id");
        if (propositionId === action.payload.propositionId) {
          return { ...state, isFetching: true };
        }
        return state;
      },
      [str(api.fetchRootJustificationTarget.response)]: (state, action) => {
        const { rootTargetType, rootTargetId } = action.meta.requestPayload;
        const propositionId = get(state, "editEntity.id");
        if (
          rootTargetType === JustificationRootTargetTypes.PROPOSITION &&
          propositionId === rootTargetId
        ) {
          return { ...state, isFetching: false };
        }
        return state;
      },
      [str(api.fetchProposition.response)]: (state, action) => {
        const propositionId = get(state, "editEntity.id");
        if (propositionId === action.meta.requestPayload.propositionId) {
          return { ...state, isFetching: false };
        }
        return state;
      },
      [str(editors.commitEdit.result)]: {
        throw: editorErrorReducer("proposition"),
      },
    },
    defaultEditorState
  ),

  [EditorTypes.COUNTER_JUSTIFICATION]: handleActions<EditorState, any>(
    {
      [str(editors.addPropositionCompoundAtom)]: makeAddAtomReducer(
        "basis.propositionCompound.atoms",
        makeNewPropositionAtom
      ),
      [str(editors.removePropositionCompoundAtom)]: makeRemoveAtomReducer(
        "basis.propositionCompound.atoms"
      ),
      [str(editors.addJustificationBasisCompoundAtom)]: makeAddAtomReducer(
        "basis.justificationBasisCompound.atoms",
        makeNewJustificationBasisCompoundAtom
      ),
      [str(editors.removeJustificationBasisCompoundAtom)]:
        makeRemoveAtomReducer("basis.justificationBasisCompound.atoms"),
      [str(
        editors.addJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl
      )]: makeAddUrlReducer(({ atomIndex }: { atomIndex: number }) => [
        "basis",
        "justificationBasisCompound",
        "atoms",
        atomIndex,
        "sourceExcerptParaphrase",
        "sourceExcerpt",
        "writQuote",
        "urls",
      ]),
      [str(
        editors.removeJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl
      )]: makeRemoveUrlReducer(({ atomIndex }: { atomIndex: number }) => [
        "basis",
        "justificationBasisCompound",
        "atoms",
        atomIndex,
        "sourceExcerptParaphrase",
        "sourceExcerpt",
        "writQuote",
        "urls",
      ]),
      [str(editors.commitEdit.result)]: {
        throw: editorErrorReducer("justification"),
      },
    },
    defaultEditorState
  ),

  [EditorTypes.NEW_JUSTIFICATION]: handleActions<EditorState, any>(
    {
      [str(editors.addUrl)]: (state) => {
        const editEntity = {
          ...state.editEntity,
        } as unknown as JustificationEditEntity;
        editEntity.basis.writQuote.urls =
          editEntity.basis.writQuote.urls.concat([makeNewUrl()]);
        return { ...state, editEntity };
      },
      [str(editors.removeUrl)]: (state, action) => {
        const editEntity = {
          ...state.editEntity,
        } as unknown as JustificationEditEntity;

        const urls = clone(editEntity.basis.writQuote.urls);
        removeAt(urls, action.payload.index);
        editEntity.basis.writQuote.urls = urls;

        return { ...state, editEntity };
      },
      [str(editors.addPropositionCompoundAtom)]: makeAddAtomReducer(
        "basis.propositionCompound.atoms",
        makeNewPropositionAtom
      ),
      [str(editors.removePropositionCompoundAtom)]: makeRemoveAtomReducer(
        "basis.propositionCompound.atoms"
      ),
      [str(editors.addJustificationBasisCompoundAtom)]: makeAddAtomReducer(
        "basis.justificationBasisCompound.atoms",
        makeNewJustificationBasisCompoundAtom
      ),
      [str(editors.removeJustificationBasisCompoundAtom)]:
        makeRemoveAtomReducer("basis.justificationBasisCompound.atoms"),
      [str(
        editors.addJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl
      )]: makeAddUrlReducer(({ atomIndex }) => [
        "basis",
        "justificationBasisCompound",
        "atoms",
        atomIndex,
        "sourceExcerptParaphrase",
        "sourceExcerpt",
        "writQuote",
        "urls",
      ]),
      [str(
        editors.removeJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl
      )]: makeRemoveUrlReducer(({ atomIndex }) => [
        "basis",
        "justificationBasisCompound",
        "atoms",
        atomIndex,
        "sourceExcerptParaphrase",
        "sourceExcerpt",
        "writQuote",
        "urls",
      ]),
      [str(editors.commitEdit.result)]: {
        throw: editorErrorReducer("justification"),
      },
    },
    defaultEditorState
  ),

  [EditorTypes.PROPOSITION_JUSTIFICATION]: handleActions<EditorState, any>(
    {
      [str(editors.addSpeaker)]: (state) => {
        const editEntity =
          state.editEntity as unknown as PropositionJustificationsEditEntity;
        const speakers = editEntity.speakers;
        return assign({}, state, {
          editEntity: {
            ...editEntity,
            speakers: [makeNewPersorg(), ...speakers],
          },
        });
      },
      [str(editors.removeSpeaker)]: (state, action) => {
        const editEntity =
          state.editEntity as unknown as PropositionJustificationsEditEntity;
        const speakers = clone(editEntity.speakers);
        removeAt(speakers, action.payload.index);
        return assign({}, state, {
          editEntity: {
            ...editEntity,
            speakers,
          },
        });
      },
      [str(editors.replaceSpeaker)]: (state, action) => {
        const editEntity =
          state.editEntity as unknown as PropositionJustificationsEditEntity;
        const speakers = clone(editEntity.speakers);
        speakers[action.payload.index] = action.payload.speaker;
        return assign({}, state, {
          editEntity: {
            ...editEntity,
            speakers,
          },
        });
      },
      [str(editors.addUrl)]: (state) => {
        const editEntity =
          state.editEntity as unknown as PropositionJustificationsEditEntity;
        const writQuote = { ...editEntity.newJustification.basis.writQuote };
        writQuote.urls = writQuote.urls.concat([makeNewUrl()]);
        return merge(
          { ...state },
          { editEntity: { newJustification: { basis: { writQuote } } } }
        );
      },
      [str(editors.removeUrl)]: (state, action) => {
        const editEntity = {
          ...state.editEntity,
        } as unknown as PropositionJustificationsEditEntity;

        const urls = clone(editEntity.newJustification.basis.writQuote.urls);
        removeAt(urls, action.payload.index);
        editEntity.newJustification.basis.writQuote.urls = urls;

        return { ...state, editEntity };
      },
      [str(editors.addPropositionCompoundAtom)]: makeAddAtomReducer(
        "newJustification.basis.propositionCompound.atoms",
        makeNewPropositionAtom
      ),
      [str(editors.removePropositionCompoundAtom)]: makeRemoveAtomReducer(
        "newJustification.basis.propositionCompound.atoms"
      ),
      [str(editors.addJustificationBasisCompoundAtom)]: makeAddAtomReducer(
        "newJustification.basis.justificationBasisCompound.atoms",
        makeNewJustificationBasisCompoundAtom
      ),
      [str(editors.removeJustificationBasisCompoundAtom)]:
        makeRemoveAtomReducer(
          "newJustification.basis.justificationBasisCompound.atoms"
        ),
      [str(
        editors.addJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl
      )]: makeAddUrlReducer(({ atomIndex }) => [
        "newJustification",
        "basis",
        "justificationBasisCompound",
        "atoms",
        atomIndex,
        "sourceExcerptParaphrase",
        "sourceExcerpt",
        "writQuote",
        "urls",
      ]),
      [str(
        editors.removeJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl
      )]: makeRemoveUrlReducer(({ atomIndex }) => [
        "newJustification",
        "basis",
        "justificationBasisCompound",
        "atoms",
        atomIndex,
        "sourceExcerptParaphrase",
        "sourceExcerpt",
        "writQuote",
        "urls",
      ]),

      [str(editors.tagProposition)]: makePropositionTagReducer(
        PropositionTagVotePolarities.POSITIVE,
        concat
      ),
      [str(editors.unTagProposition)]: makePropositionTagReducer(
        PropositionTagVotePolarities.POSITIVE,
        difference
      ),
    },
    defaultEditorState
  ),

  [EditorTypes.WRIT_QUOTE]: handleActions<EditorState, any, any>(
    {
      [str(editors.addUrl)]: (state) => {
        const editEntity = { ...state.editEntity } as WritQuote;
        editEntity.urls = editEntity.urls.concat([makeNewUrl()]);
        return { ...state, editEntity };
      },
      [str(editors.removeUrl)]: (state, action) => {
        const editEntity = { ...state.editEntity } as WritQuote;

        const urls = clone(editEntity.urls);
        removeAt(urls, action.payload.index);
        editEntity.urls = urls;

        return { ...state, editEntity };
      },
      [str(api.fetchWritQuote)]: (state, action) => {
        const writQuoteId = get(state, "editEntity.id");
        if (writQuoteId === action.payload.writQuoteId) {
          return { ...state, isFetching: true };
        }
        return state;
      },
      [str(api.fetchWritQuote.response)]: (state, action) => {
        const writQuoteId = get(state, "editEntity.id");
        if (writQuoteId === action.meta.requestPayload.writQuoteId) {
          return { ...state, isFetching: false };
        }
        return state;
      },
      [str(editors.commitEdit.result)]: {
        throw: editorErrorReducer("writQuote"),
      },
    },
    defaultEditorState
  ),

  [EditorTypes.LOGIN_CREDENTIALS]: handleActions<EditorState, any>(
    {
      [str(editors.commitEdit.result)]: {
        throw: (state, action) => {
          const sourceError = action.payload.sourceError;
          if (sourceError.errorType === uiErrorTypes.API_RESPONSE_ERROR) {
            switch (get(sourceError, "body.errorCode")) {
              case apiErrorCodes.INVALID_LOGIN_CREDENTIALS: {
                return {
                  ...state,
                  errors: {
                    credentials: { modelErrors: [INVALID_LOGIN_CREDENTIALS] },
                  },
                  isSaving: false,
                };
              }
              case apiErrorCodes.USER_IS_INACTIVE_ERROR: {
                return {
                  ...state,
                  errors: {
                    credentials: { modelErrors: [USER_IS_INACTIVE_ERROR] },
                  },
                  isSaving: false,
                };
              }
              case apiErrorCodes.VALIDATION_ERROR: {
                const errors = sourceError.body.errors.credentials;
                return { ...state, errors, isSaving: false };
              }
              default:
                return {
                  ...state,
                  errors: { credentials: { modelErrors: [UNABLE_TO_LOGIN] } },
                  isSaving: false,
                };
            }
          }

          return { ...state, isSaving: false };
        },
      },
    },
    defaultEditorState
  ),

  [EditorTypes.REGISTRATION_REQUEST]: handleActions<EditorState, any>(
    {
      [str(editors.commitEdit.result)]: {
        next: (state, action) => ({
          ...state,
          duration: action.payload.result.duration,
          isSaving: false,
          isSaved: true,
        }),
        throw: (state, action) => {
          state = editorErrorReducer("registration")(state, action);
          state.isSaved = false;
          return state;
        },
      },
      [str(editors.resetSubmission)]: (state) => ({ ...state, isSaved: false }),
    },
    defaultEditorState
  ),

  [EditorTypes.REGISTRATION_CONFIRMATION]: handleActions<EditorState, any>(
    {
      [str(editors.commitEdit.result)]: {
        next: (state) => ({ ...state, isSaving: false, isSaved: true }),
        throw: (state, action) => {
          state = editorErrorReducer("registrationConfirmation")(state, action);
          state.isSaved = false;
          return state;
        },
      },
      [str(editors.resetSubmission)]: (state) => ({ ...state, isSaved: false }),
    },
    defaultEditorState
  ),
};

type Combiner = (one: Array<unknown>, two: Array<unknown>) => Array<unknown>;
function makePropositionTagReducer(
  polarity: PropositionTagVotePolarity,
  combiner: Combiner
) {
  return (state: EditorState, action: AnyAction) => {
    if (!state.editEntity || !("proposition" in state.editEntity)) {
      logger.error(
        "editEntity was missing or not a PropositionJustificationsEditEntity"
      );
      return state;
    }
    const editEntity = state.editEntity as PropositionJustificationsEditEntity;
    const proposition = editEntity.proposition;
    const { tag } = action.payload;

    const oldPropositionTagVotes = get(proposition, "propositionTagVotes", []);
    const redundantPropositionTagVotes = [],
      contradictoryPropositionTagVotes = [];
    forEach(oldPropositionTagVotes, (vote) => {
      if (vote.proposition.id === proposition.id && tagEqual(vote.tag, tag)) {
        if (vote.polarity === polarity) {
          redundantPropositionTagVotes.push(vote);
        } else {
          contradictoryPropositionTagVotes.push(vote);
        }
      }
    });

    const oldTags = get(proposition, "tags", []);
    const existingTag = find(oldTags, (oldTag) => tagEqual(oldTag, tag));
    const tags = existingTag ? oldTags : combiner(oldTags, [tag]);

    if (
      tags === oldTags &&
      redundantPropositionTagVotes.length > 0 &&
      contradictoryPropositionTagVotes.length < 1
    ) {
      logger.debug(`Proposition is already tagged with ${tag}`);
      return state;
    }

    const propositionTagVotes =
      redundantPropositionTagVotes.length > 0
        ? oldPropositionTagVotes
        : combiner(oldPropositionTagVotes, [
            makePropositionTagVote({ polarity, tag, proposition }),
          ]);

    return {
      ...state,
      editEntity: {
        ...state.editEntity,
        proposition: { ...proposition, tags, propositionTagVotes },
      },
    };
  };
}

type EditorTypeState = { [key: EditorId]: EditorState };
// The editor reducer state is a two-level map: editorType -> editorId -> editorState
type ReducerState = { [key in EditorType]: EditorTypeState };

interface EditorPayload {
  editorType: EditorType;
  editorId: EditorId;
}
const handleEditorAction = (
  state: ReducerState,
  action: ActionMeta<EditorPayload, EditorMeta>
) => {
  const { editorType, editorId } = action.payload;

  if (!editorType) {
    throw newProgrammingError("editorType is required");
  }
  if (!editorId) {
    throw newProgrammingError("editorId is required");
  }

  // editorState could be undefined
  const editorState = get(state, [editorType, editorId], defaultEditorState);
  const editorReducer = editorReducerByType[editorType];
  let newEditorState = editorReducer
    ? editorReducer(editorState, action)
    : editorState;
  if (newEditorState === editorState) {
    // If the type-specific editor reducer didn't update the state, give the default reducer a crack at it
    // Basically we would like to be able to define default behavior for the editor actions in one place
    // If a type-specific editor reducer wants to override this behavior to do nothing, it can do
    // [actionType]: (state) => ({...state})
    newEditorState = defaultEditorReducer(editorState, action);
  }
  return editorState === newEditorState
    ? state
    : assign({}, state, {
        [editorType]: assign({}, state[editorType], {
          [editorId]: newEditorState,
        }),
      });
};

const handleNonEditorAction = (
  state: ReducerState,
  action: ActionMeta<any, EditorMeta>
) => {
  let stateHasChanged = false;
  const nextState = {} as ReducerState;
  for (let editorType in EditorTypes) {
    const editorStates = state[editorType as EditorType];
    // The same editor applies to all states within its key
    const editorReducer = editorReducerByType[editorType as EditorType];
    let editorTypeStateHasChanged = false;
    const nextEditorTypeStates: EditorTypeState = {};
    forEach(editorStates, (editorState, editorId) => {
      let nextEditorState = editorReducer
        ? editorReducer(editorState, action)
        : editorState;
      // Don't check the defaultEditorReducer for non-editor actions
      const editorStateHasChanged = nextEditorState !== editorState;
      editorTypeStateHasChanged =
        editorTypeStateHasChanged || editorStateHasChanged;
      nextEditorTypeStates[editorId] = editorStateHasChanged
        ? nextEditorState
        : editorState;
    });
    stateHasChanged = stateHasChanged || editorTypeStateHasChanged;
    nextState[editorType as EditorType] = editorTypeStateHasChanged
      ? nextEditorTypeStates
      : editorStates;
  }

  return stateHasChanged ? nextState : state;
};

export default (
  state: ReducerState = {} as ReducerState,
  action: ActionMeta<any, EditorMeta>
) => {
  const isEditorAction = has(EditorActions, action.type);
  if (isEditorAction) {
    return handleEditorAction(state, action);
  } else {
    return handleNonEditorAction(state, action);
  }
};
