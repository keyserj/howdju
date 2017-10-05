import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FontIcon from 'react-md/lib/FontIcons'
import Button from 'react-md/lib/Buttons/Button'
import SelectionControlGroup from 'react-md/lib/SelectionControls/SelectionControlGroup'
import get from 'lodash/get'

import {
  JustificationBasisCompoundAtomType,
  newExhaustedEnumError,
} from 'howdju-common'

import SourceExcerptParaphraseEditorFields from './SourceExcerptParaphraseEditorFields'
import StatementEditorFields from "./StatementEditorFields"

import './JustificationBasisCompoundAtomEditorFields.scss'

export default class JustificationBasisCompoundAtomEditorFields extends Component {

  onChange = (value, event) => {
    const name = event.target.name
    this.props.onPropertyChange({[name]: value})
  }

  render() {
    const {
      atom,
      name,
      id,
      suggestionsKey,
      errors,
      onAddJustificationBasisCompoundAtom,
      onRemoveJustificationBasisCompoundAtom,
      disabled,
      onPropertyChange,
      onTextInputKeyDown,
      readOnlyBasis,
      // onPropertyChange,
      // onTextInputKeyDown,
      onAddWritQuoteUrl,
      onRemoveWritQuoteUrl,
    } = this.props

    const atomTypeControls = (
      <SelectionControlGroup
        id={id + "-type"}
        name={name + ".type"}
        type="radio"
        value={atom.type}
        onChange={this.onChange}
        controls={[
          {
            value: JustificationBasisCompoundAtomType.STATEMENT,
            label: <FontIcon>short_text</FontIcon>,
            title: 'Statement',
          },
          {
            value: JustificationBasisCompoundAtomType.SOURCE_EXCERPT_PARAPHRASE,
            label: <FontIcon>book</FontIcon>,
            title: 'Source excerpt paraphrase',
          }
        ]}
        disabled={readOnlyBasis || disabled}
      />
    )

    let entityControls
    switch (atom.type) {
      case JustificationBasisCompoundAtomType.STATEMENT: {
        const entityEditorFieldsId = id + '-statement'
        const entityEditorFieldsName = name + '.statement'
        const entity = atom.statement
        const entityEditorFieldsErrors = get(errors, 'fieldErrors.statement')
        entityControls = (
          <StatementEditorFields
            id={entityEditorFieldsId}
            name={entityEditorFieldsName}
            statement={entity}
            disabled={disabled}
            suggestionsKey={suggestionsKey}
            onPropertyChange={onPropertyChange}
            onKeyDown={onTextInputKeyDown}
            errors={entityEditorFieldsErrors}
          />
        )
        break
      }
      case JustificationBasisCompoundAtomType.SOURCE_EXCERPT_PARAPHRASE: {
        const entityEditorFieldsId = id + '-source-excerpt-paraphrase'
        const entityEditorFieldsName = name + '.sourceExcerptParaphrase'
        const entity = atom.sourceExcerptParaphrase
        const entityEditorFieldsErrors = get(errors, 'fieldErrors.sourceExcerptParaphrase')
        entityControls = (
          <SourceExcerptParaphraseEditorFields
            id={entityEditorFieldsId}
            name={entityEditorFieldsName}
            sourceExcerptParaphrase={entity}
            disabled={disabled}
            suggestionsKey={suggestionsKey}
            onPropertyChange={onPropertyChange}
            onKeyDown={onTextInputKeyDown}
            errors={entityEditorFieldsErrors}
            onAddWritQuoteUrl={onAddWritQuoteUrl}
            onRemoveWritQuoteUrl={onRemoveWritQuoteUrl}
          />
        )
        break
      }
      default:
        throw newExhaustedEnumError('JustificationBasisCompoundAtomType', atom.type)
    }

    const addRemoveAtomControls = disabled ?
      <div/> :
      <div>
        <Button icon onClick={onAddJustificationBasisCompoundAtom}>add</Button>
        <Button icon onClick={onRemoveJustificationBasisCompoundAtom}>delete</Button>
      </div>

    return (
      <div className="justification-basis-compound-atom-editor-fields">
        <div className="justification-basis-compound-atom-editor-fields--atom-type-controls">
          {atomTypeControls}
        </div>
        <div className="justification-basis-compound-atom-editor-fields--entity-controls">
          {entityControls}
        </div>
        <div className="justification-basis-compound-atom-editor-fields--add-remove-atom-controls">
          {addRemoveAtomControls}
        </div>
      </div>
    )
  }
}
JustificationBasisCompoundAtomEditorFields.propTypes = {
  atom: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  suggestionsKey: PropTypes.string,
  errors: PropTypes.object,
  onAddJustificationBasisCompoundAtom: PropTypes.func,
  onRemoveJustificationBasisCompoundAtom: PropTypes.func,
  disabled: PropTypes.bool,
  onPropertyChange: PropTypes.func.isRequired,
  onTextInputKeyDown: PropTypes.func,
}