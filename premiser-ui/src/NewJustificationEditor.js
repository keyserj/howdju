import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from "react-redux"
import {Button, CircularProgress} from 'react-md'
import get from 'lodash/get'

import {
  makeNewJustification
} from "howdju-common"

import {
  editors,
  mapActionCreatorGroupToDispatchToProps,
} from './actions'
import {EditorTypes} from "./reducers/editors"
import t, {
  CANCEL_BUTTON_LABEL,
  EDIT_PROPOSITION_SUBMIT_BUTTON_LABEL
} from "./texts"
import {
  combineIds,
  translateNewJustificationErrors
} from './viewModels'
import NewJustificationEditorFields from "./NewJustificationEditorFields"


class NewJustificationEditor extends Component {

  onPropertyChange = (properties) => {
    this.props.editors.propertyChange(NewJustificationEditor.editorType, this.props.editorId, properties)
  }

  onAddUrl = () => {
    this.props.editors.addUrl(NewJustificationEditor.editorType, this.props.editorId)
  }

  onRemoveUrl = (url, index) => {
    this.props.editors.removeUrl(NewJustificationEditor.editorType, this.props.editorId, url, index)
  }

  onAddPropositionCompoundAtom = () => {
    this.props.editors.addPropositionCompoundAtom(NewJustificationEditor.editorType, this.props.editorId)
  }

  onRemovePropositionCompoundAtom = (atom, index) => {
    this.props.editors.removePropositionCompoundAtom(NewJustificationEditor.editorType, this.props.editorId, atom, index)
  }

  addJustificationBasisCompoundAtom = (index) => {
    this.props.editors.addJustificationBasisCompoundAtom(NewJustificationEditor.editorType, this.props.editorId, index)
  }

  removeJustificationBasisCompoundAtom = (atom, index) => {
    this.props.editors.removeJustificationBasisCompoundAtom(NewJustificationEditor.editorType,
      this.props.editorId, atom, index)
  }

  onAddJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl = (atomIndex, urlIndex) => {
    this.props.editors.addJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl(
      NewJustificationEditor.editorType, this.props.editorId, atomIndex, urlIndex)
  }

  onRemoveJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl = (atom, atomIndex, url, urlIndex) => {
    this.props.editors.removeJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl(
      NewJustificationEditor.editorType, this.props.editorId, atom, atomIndex, url, urlIndex)
  }

  onSubmit = (event) => {
    if (!this.props.onSubmit) {
      event.preventDefault()
      this.props.editors.commitEdit(NewJustificationEditor.editorType, this.props.editorId)
    } else {
      this.props.onSubmit(event)
    }
  }

  onCancelEdit = () => {
    this.props.editors.cancelEdit(NewJustificationEditor.editorType, this.props.editorId)
  }

  render() {
    const {
      id,
      editorState,
      doShowButtons,
      ...rest
    } = this.props
    delete rest.editors
    delete rest.editorId
    delete rest.onSubmit

    const newJustification = editorState.editEntity || makeNewJustification()
    const {errors, isSaving} = editorState
    const newJustificationErrors = translateNewJustificationErrors(newJustification, errors) || errors

    const buttons = [
      <Button
        flat
        key="cancelButton"
        children={t(CANCEL_BUTTON_LABEL)}
        onClick={this.onCancelEdit}
      />,
      <Button
        flat
        primary
        key="submitButton"
        type="submit"
        children={t(EDIT_PROPOSITION_SUBMIT_BUTTON_LABEL)}
        disabled={isSaving}
      />
    ]

    return (
      <form className="new-justification-editor" onSubmit={this.onSubmit}>
        <NewJustificationEditorFields
          {...rest}
          newJustification={newJustification}
          id={combineIds(id, 'editor-fields')}
          onPropertyChange={this.onPropertyChange}
          onAddUrl={this.onAddUrl}
          onRemoveUrl={this.onRemoveUrl}
          onAddPropositionCompoundAtom={this.onAddPropositionCompoundAtom}
          onRemovePropositionCompoundAtom={this.onRemovePropositionCompoundAtom}
          onAddJustificationBasisCompoundAtom={this.addJustificationBasisCompoundAtom}
          onRemoveJustificationBasisCompoundAtom={this.removeJustificationBasisCompoundAtom}
          onAddJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl={this.onAddJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl}
          onRemoveJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl={this.onRemoveJustificationBasisCompoundAtomSourceExcerptParaphraseWritQuoteUrl}
          onSubmit={this.onSubmit}
          errors={newJustificationErrors}
        />
        {isSaving && <CircularProgress key="progress" id="progress" />}
        {doShowButtons && buttons}
      </form>
    )
  }
}
NewJustificationEditor.propTypes = {
  /** Identifies the editor's state */
  editorId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  /** If omitted, no autocomplete */
  suggestionsKey: PropTypes.string,
  /** If present, defers submits to this function */
  onSubmit: PropTypes.func,
  doShowButtons: PropTypes.bool,
  disabled: PropTypes.bool,
  onKeyDown: PropTypes.func,
}
NewJustificationEditor.defaultProps = {
  doShowButtons: true
}
NewJustificationEditor.editorType = EditorTypes.NEW_JUSTIFICATION

const mapStateToProps = (state, ownProps) => {
  const editorState = get(state.editors, [EditorTypes.NEW_JUSTIFICATION, ownProps.editorId]) || {}
  return {
    editorState,
  }
}

export default connect(mapStateToProps, mapActionCreatorGroupToDispatchToProps({
  editors,
}))(NewJustificationEditor)