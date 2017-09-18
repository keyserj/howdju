import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from "react-redux"
import CircularProgress from "react-md/lib/Progress/CircularProgress"
import get from 'lodash/get'
import {denormalize} from "normalizr"

import {EditorTypes} from "./reducers/editors"
import StatementCompoundViewer from "./StatementCompoundViewer"
import {statementCompoundSchema} from "./schemas"

class EditableStatementCompound extends Component {

  render() {
    const {
      id,
      statementCompound,
      isFetching,
      // Currently statement compounds are not editable.  Only their statements are.  Instead create a new statement compound justification
      // isEditing,
      doShowControls,
      doShowStatementAtomJustifications,
      isCondensed,
      isUnCondensed,
      editorId,
      suggestionsKey,
      ...rest
    } = this.props

    const viewer =
        <StatementCompoundViewer {...rest}
                                 id={id}
                                 statementCompound={statementCompound}
                                 doShowControls={doShowControls}
                                 doShowStatementAtomJustifications={doShowStatementAtomJustifications}
                                 isCondensed={isCondensed}
                                 isUnCondensed={isUnCondensed}
        />
    const progress =
        <CircularProgress id={`${id}-Progress`} />

    return isFetching ? progress : viewer
  }
}
EditableStatementCompound.propTypes = {
  /** Required for the CircularProgress */
  id: PropTypes.string.isRequired,
  /** Let's the component fetch its statement from the API and retrieve it from the state */
  entityId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  /** Identifies the editor's state */
  editorId: PropTypes.string.isRequired,
  /** If omitted, no autocomplete */
  suggestionsKey: PropTypes.string,
  doShowControls: PropTypes.bool,
  doShowAtomJustifications: PropTypes.bool,
  isCondensed: PropTypes.bool,
  isUnCondensed: PropTypes.bool,
}

const mapStateToProps = (state, ownProps) => {
  const normalStatementCompound = state.entities.statementCompounds[ownProps.entityId]
  const statementCompound = denormalize(normalStatementCompound, statementCompoundSchema, state.entities)
  const editEntity = get(state.editors, [EditorTypes.STATEMENT_COMPOUND, ownProps.editorId, 'editEntity'])
  const isEditing = !!editEntity

  return {
    statementCompound,
    isEditing,
  }
}

export default connect(mapStateToProps)(EditableStatementCompound)