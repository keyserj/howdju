import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from "react-redux"
import Button from 'react-md/lib/Buttons/Button'
import Dialog from 'react-md/lib/Dialogs'
import get from 'lodash/get'

import {
  EditorTypes
} from './reducers/editors'
import t, {
  CANCEL_BUTTON_LABEL,
  CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL,
} from "./texts"
import {selectIsWindowNarrow} from "./selectors"

import NewJustificationEditor from './NewJustificationEditor'


class NewJustificationDialog extends Component {

  render() {
    const {
      id,
      editorId,
      suggestionsKey,
      visible,
      onCancel,
      onSubmit,
      onHide,
      isWindowNarrow,
      isSaving,
    } = this.props

    // Putting these buttons in an array to reuse in both places requires giving them a key, which led to the warning
    // "ButtonTooltipedInked: `key` is not a prop. Trying to access it will result in `undefined` being returned."
    // So just handle them separately so that we don't need to give them a key
    const addNewJustificationDialogCancelButton = (
      <Button flat
              label={t(CANCEL_BUTTON_LABEL)}
              onClick={onCancel}
              disabled={isSaving}
      />
    )
    const addNewJustificationDialogSubmitButton = (
      <Button raised
              primary
              type="submit"
              label={t(CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL)}
              onClick={onSubmit}
              disabled={isSaving}
      />
    )
    // react-md bug: even though fullPage is documented as a boolean property, its presence appears to be interpreted as true
    const addNewJustificationDialogTitle = "Add justification"
    const narrowDialogAttributes = {
      fullPage: true,
      'aria-label': addNewJustificationDialogTitle
    }
    const notNarrowDialogAttributes = {
      title: addNewJustificationDialogTitle,
      actions: [
        addNewJustificationDialogCancelButton,
        addNewJustificationDialogSubmitButton,
      ],
    }
    const widthDependentAttributes = isWindowNarrow ? narrowDialogAttributes : notNarrowDialogAttributes

    return (
      <Dialog id="newJustificationDialog"
              visible={visible}
              onHide={onHide}
              className="md-overlay--wide-dialog"
              {...widthDependentAttributes}
      >
        {/* react-md bug: Title disappears when full page*/}
        {isWindowNarrow && (
          <h2 id="newJustificationDialogTitle" className="md-title md-title--dialog">
            {addNewJustificationDialogTitle}
          </h2>
        )}
        <NewJustificationEditor
          editorId={editorId}
          id={id}
          suggestionsKey={suggestionsKey}
          onSubmit={this.onSubmitNewJustificationDialog}
          doShowButtons={false}
          onKeyDown={this.onDialogEditorKeyDown}
        />
        {/* react-md bug: actions disappear when full page*/}
        {isWindowNarrow && (
          <footer className="md-dialog-footer md-dialog-footer--inline">
            {addNewJustificationDialogCancelButton}
            {addNewJustificationDialogSubmitButton}
          </footer>
        )}
      </Dialog>
    )
  }
}
NewJustificationDialog.propTypes = {
  id: PropTypes.string.isRequired,
  editorId: PropTypes.string.isRequired,
}

const mapStateToProps = (state, ownProps) => {

  const editorState = get(state.editors, [
    EditorTypes.NEW_JUSTIFICATION,
    ownProps.editorId,
  ], {})
  const isSaving = editorState.isSaving

  const isWindowNarrow = selectIsWindowNarrow(state)

  return {
    isWindowNarrow,
    isSaving,
  }
}

export default connect(mapStateToProps)(NewJustificationDialog)