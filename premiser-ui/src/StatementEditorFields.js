import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FontIcon from 'react-md/lib/FontIcons'
import FocusContainer from 'react-md/lib/Helpers/FocusContainer'
import TextField from "react-md/lib/TextFields";

import StatementTextAutocomplete from './StatementTextAutocomplete'
import {toErrorText} from "./modelErrorMessages";
import {RETURN_KEY_CODE} from "./keyCodes";
import ErrorMessages from "./ErrorMessages";

class StatementEditorFields extends Component {

  constructor() {
    super()

    this.onChange = this.onChange.bind(this)
    this.onTextInputKeyDown = this.onTextInputKeyDown.bind(this)
  }

  onChange(val, event) {
    const name = event.target.name
    this.props.onPropertyChange({[name]: val})
  }

  onTextInputKeyDown(event) {
    if (event.keyCode === RETURN_KEY_CODE && this.props.onSubmit) {
      event.preventDefault()
      this.props.onSubmit(event)
    } else if (this.props.onKeyDown) {
      this.props.onKeyDown(event)
    }
  }

  render() {
    const {
      statement,
      suggestionsKey,
      name,
      id,
      disabled,
      onPropertyChange,
      errors,
      focusOnMount,
      ...rest,
    } = this.props
    delete rest.onKeyDown


    const modelErrors = errors && errors.modelErrors
    const textInputProps = errors && errors.hasErrors && errors.fieldErrors.text.length > 0 ?
        {...rest, error: true, errorText: toErrorText(errors.fieldErrors.text)} :
        rest

    const idPrefix = id ? id + '.' : ''
    const namePrefix = name ? name + '.' : ''
    const suggestionsKeyPrefix = suggestionsKey ? suggestionsKey + '.' : ''
    const text = statement ? statement.text : ''

    const input = (suggestionsKey && !disabled) ?
        <StatementTextAutocomplete id={idPrefix + "text"}
                                   name={namePrefix + "text"}
                                   label="Text"
                                   required
                                   value={text}
                                   suggestionsKey={suggestionsKeyPrefix + 'text'}
                                   onPropertyChange={onPropertyChange}
                                   leftIcon={<FontIcon>text_fields</FontIcon>}
                                   onKeyDown={this.onTextInputKeyDown}
                                   {...textInputProps}
        /> :
        <TextField id={idPrefix + 'text'}
                   name={namePrefix + "text"}
                   label="Text"
                   type="text"
                   value={text}
                   required
                   onChange={this.onChange}
                   leftIcon={<FontIcon>text_fields</FontIcon>}
                   disabled={disabled}
                   onKeyDown={this.onTextInputKeyDown}
                   {...textInputProps}
        />
    return (
        <FocusContainer focusOnMount={focusOnMount}>
          <ErrorMessages errors={modelErrors}/>
          {input}
        </FocusContainer>
    )
  }
}
StatementEditorFields.propTypes = {
  statement: PropTypes.object,
  /** If present, this string will be prepended to this editor's controls' ids, with an intervening "." */
  id: PropTypes.string,
  /** If present, this string will be prepended to this editor's controls' names, with an intervening "." */
  name: PropTypes.string,
  /** If omitted, no autocomplete */
  suggestionsKey: PropTypes.string,
  onPropertyChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  focusOnMount: PropTypes.bool,
  onKeyDown: PropTypes.func,
}
StatementEditorFields.defaultProps = {
  disabled: false,
  focusOnMount: true,
}

export default StatementEditorFields