import React, {Component} from "react";
import {connect} from "react-redux";
import {denormalize} from "normalizr";
import { Link } from 'react-router-dom'
import DocumentTitle from "react-document-title";
import Divider from "react-md/lib/Dividers";
import FontIcon from "react-md/lib/FontIcons";
import MenuButton from "react-md/lib/Menus/MenuButton";
import ListItem from "react-md/lib/Lists/ListItem";
import Dialog from 'react-md/lib/Dialogs'
import Positions from "react-md/lib/Menus/Positions";
import Button from 'react-md/lib/Buttons/Button'
import CircularProgress from 'react-md/lib/Progress/CircularProgress'
import sortBy from "lodash/sortBy";
import forEach from 'lodash/forEach';
import some from 'lodash/some'
import cn from 'classnames'
import get from 'lodash/get'

import {logger} from "./util";
import {
  isVerified,
  isDisverified,
  isPositive,
  isNegative,
  makeNewJustificationTargetingStatementId,
  JustificationBasisSourceType,
} from "./models";
import GridCard from './GridCard';
import {
  api,
  editors, mapActionCreatorGroupToDispatchToProps,
  ui,
  goto, flows,
} from "./actions";
import {justificationsSchema, statementSchema} from "./schemas";
import paths from './paths'
import text, {
  ADD_JUSTIFICATION_CALL_TO_ACTION,
  CANCEL_BUTTON_LABEL,
  CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL,
} from "./texts";
import NewJustificationEditor from './NewJustificationEditor'
import {
  statementJustificationsPage_statementEditor_editorId,
  statementJustificationsPage_newJustificationDialog_newJustificationEditor_editorId
} from "./editorIds";
import {EditorTypes} from "./reducers/editors";
import EditableStatement from "./EditableStatement";
import {suggestionKeys} from "./autocompleter";
import {ESCAPE_KEY_CODE} from "./keyCodes";

import "./StatementJustificationsPage.scss";
import StatementJustificationTrees from "./StatementJustificationTrees";

class StatementJustificationsPage extends Component {
  constructor() {
    super()
    this.state = {
      isOverStatement: false,
    }

    this.statementEditorId = statementJustificationsPage_statementEditor_editorId
    this.newJustificationEditorId = statementJustificationsPage_newJustificationDialog_newJustificationEditor_editorId

    this.onStatementMouseOver = this.onStatementMouseOver.bind(this)
    this.onStatementMouseLeave = this.onStatementMouseLeave.bind(this)
    this.onEditStatement = this.onEditStatement.bind(this)
    this.deleteStatement = this.deleteStatement.bind(this)

    this.showNewJustificationDialog = this.showNewJustificationDialog.bind(this)
    this.onDialogEditorKeyDown = this.onDialogEditorKeyDown.bind(this)
    this.onSubmitNewJustificationDialog = this.onSubmitNewJustificationDialog.bind(this)
    this.cancelNewJustificationDialog = this.cancelNewJustificationDialog.bind(this)

    this.saveNewJustification = this.saveNewJustification.bind(this)
  }

  componentWillMount() {
    this.props.editors.init(EditorTypes.STATEMENT, this.statementEditorId, {entityId: this.statementId()})
    this.props.api.fetchStatementJustifications(this.statementId())
  }

  statementId() {
    return this.props.match.params.statementId
  }

  onStatementMouseOver() {
    this.setState({isOverStatement: true})
  }

  onStatementMouseLeave() {
    this.setState({isOverStatement: false})
  }

  onEditStatement() {
    this.props.editors.beginEdit(EditorTypes.STATEMENT, this.statementEditorId, this.props.statement)
  }

  createJustificationPath = () => {
    return paths.createJustification(JustificationBasisSourceType.STATEMENT, this.statementId())
  }

  seeUsagesPath = () => {
    return paths.searchJustifications({statementId: this.statementId()})
  }

  deleteStatement() {
    this.props.api.deleteStatement(this.props.statement)
  }

  showNewJustificationDialog(e) {
    e.preventDefault()

    const newJustification = makeNewJustificationTargetingStatementId(this.statementId())
    this.props.editors.beginEdit(EditorTypes.NEW_JUSTIFICATION, this.newJustificationEditorId, newJustification)

    this.props.ui.showNewJustificationDialog(this.statementId())
  }

  onSubmitNewJustificationDialog(e) {
    e.preventDefault()
    this.saveNewJustification()
  }

  saveNewJustification() {
    this.props.flows.commitEditThenPutActionOnSuccess(EditorTypes.NEW_JUSTIFICATION, this.newJustificationEditorId, ui.hideNewJustificationDialog())
  }

  cancelNewJustificationDialog() {
    this.props.ui.hideNewJustificationDialog()
  }

  onDialogEditorKeyDown(event) {
    if (event.keyCode === ESCAPE_KEY_CODE) {
      // Stop the escape from closing the dialog
      event.stopPropagation()
    }
  }

  render () {
    const {
      statementId,
      statement,
      justifications,

      isFetchingStatement,
      isEditingStatement,
      didFetchingStatementFail,

      isNewJustificationDialogVisible,
      isSavingNewJustification,
      isWindowNarrow,
    } = this.props
    const {
      isOverStatement,
    } = this.state

    const doHideControls = !isOverStatement && !isWindowNarrow

    const hasJustifications = justifications && justifications.length > 0
    const hasAgreement = some(justifications, j => isVerified(j) && isPositive(j))
    const hasDisagreement = some(justifications, j => isVerified(j) && isNegative(j))

    const menu = (
        <MenuButton
            icon
            id={`statement-${statementId}-context-menu`}
            className={cn({hidden: doHideControls})}
            menuClassName="context-menu context-menu--statement"
            buttonChildren={'more_vert'}
            position={Positions.TOP_RIGHT}
            children={[
              <ListItem primaryText="Add justification"
                        key="addJustification"
                        leftIcon={<FontIcon>add</FontIcon>}
                        onClick={this.showNewJustificationDialog}
              />,
              <ListItem primaryText="Use"
                        key="use"
                        title="Justify another statement with this one"
                        leftIcon={<FontIcon>call_made</FontIcon>}
                        component={Link}
                        to={this.createJustificationPath()}
              />,
              <ListItem primaryText="See usages"
                        key="usages"
                        title="See justifications using this statement"
                        leftIcon={<FontIcon>call_merge</FontIcon>}
                        component={Link}
                        to={this.seeUsagesPath()}
              />,
              <Divider key="divider" />,
              <ListItem primaryText="Edit"
                        key="edit"
                        leftIcon={<FontIcon>create</FontIcon>}
                        onClick={this.onEditStatement}
              />,
              <ListItem primaryText="Delete"
                        key="delete"
                        leftIcon={<FontIcon>delete</FontIcon>}
                        onClick={this.deleteStatement}
              />,
            ]}
        />
    )

    const addNewJustificationDialogActions = [
      <Button flat
              key="addNewJustificationDialogCancelButton"
              label={text(CANCEL_BUTTON_LABEL)}
              onClick={this.cancelNewJustificationDialog}
              disabled={isSavingNewJustification}
      />,
      <Button raised
              primary
              key="addNewJustificationDialogSubmitButton"
              type="submit"
              label={text(CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL)}
              onClick={this.saveNewJustification}
              disabled={isSavingNewJustification}
      />
    ]
    // react-md bug: even though fullPage is documented as a boolean property, its presence appears to be interpreted as true
    const addNewJustificationDialogTitle = "Add justification"
    const fullPageProps = isWindowNarrow ? {fullPage: true} : {title: addNewJustificationDialogTitle}
    const addNewJustificationDialog = (
        <Dialog id="newJustificationDialog"
                aria-label={addNewJustificationDialogTitle}
                visible={isNewJustificationDialogVisible}
                onHide={this.cancelNewJustificationDialog}
                {...fullPageProps}
                className="md-overlay--wide-dialog"
                actions={addNewJustificationDialogActions}
        >
          {/* react-md bug: Title disappears when full page*/}
          {isWindowNarrow &&
            <h2 id="newJustificationDialogTitle" className="md-title md-title--dialog">
              Add justification
            </h2>
          }
          <NewJustificationEditor editorId={this.newJustificationEditorId}
                                  id="addNewJustificationDialogEditor"
                                  suggestionsKey={suggestionKeys.statementJustificationsPage_newJustificationDialog_newJustificationEditor_suggestions}
                                  onSubmit={this.onSubmitNewJustificationDialog}
                                  doShowButtons={false}
                                  disabled={isSavingNewJustification}
                                  onKeyDown={this.onDialogEditorKeyDown}
          />
          {/* react-md bug: actions disappears when full page*/}
          {isWindowNarrow &&
            <footer className="md-dialog-footer md-dialog-footer--inline">
              {addNewJustificationDialogActions}
            </footer>
          }
        </Dialog>
    )

    return (
        <DocumentTitle title={`${statement ? statement.text : 'Loading statement'} - Howdju`}>
          <div className="statement-justifications">

            <div className="md-grid md-grid--top">
              <div className="md-cell md-cell--12">

                <div className="statement">

                  <GridCard className={cn('statementCard', {
                              agreement: hasAgreement,
                              disagreement: hasDisagreement,
                            })}
                            cellClass="statementText"
                            onMouseOver={this.onStatementMouseOver}
                            onMouseLeave={this.onStatementMouseLeave}
                            >
                    {statement && !isEditingStatement && menu}
                    <EditableStatement id={`editableStatement-${statementId}`}
                                       textId={`editableStatement-${statementId}-statementEditorText`}
                                       entityId={statementId}
                                       editorId={this.statementEditorId}
                                       suggestionsKey={suggestionKeys.statementJustificationsPage_statementEditor}
                    />
                  </GridCard>

                </div>

              </div>

              {!hasJustifications && !isFetchingStatement && !didFetchingStatementFail && [
                <div className="md-cell md-cell--12 cell--centered-contents"
                     key="justification-statements-page-no-justifications-message"
                >
                  <div>No justifications.</div>
                </div>,
                <div className="md-cell md-cell--12 cell--centered-contents"
                     key="justification-statements-page-no-justifications-add-justification-button"
                >
                  <Button flat
                          label={text(ADD_JUSTIFICATION_CALL_TO_ACTION)}
                          onClick={this.showNewJustificationDialog}
                  />
                </div>

              ]}
            </div>

            {isFetchingStatement &&
                <div className="md-grid md-grid--bottom">
                  <div className="md-cell md-cell--12 cell--centered-contents">
                    <CircularProgress key="progress" id="statementJustificationsProgress" />
                  </div>
                </div>

            }

            <StatementJustificationTrees justifications={justifications}
                                         doShowControls={true}
                                         doShowJustifications={false}
                                         isUnCondensed={true}
                                         className="md-grid--bottom"
            />

            {addNewJustificationDialog}

          </div>

        </DocumentTitle>
    )
  }
}
StatementJustificationsPage.transientId = 'statement-justifications-page-statement'

const sortJustifications = justifications => {
  justifications = sortBy(justifications, j => j.score)
  justifications = sortBy(justifications, j => isDisverified(j) ? 1 : isVerified(j) ? -1 : 0)
  forEach(justifications, j => {
    j.counterJustifications = sortJustifications(j.counterJustifications)
  })
  return justifications
}

const mapStateToProps = (state, ownProps) => {
  const statementId = ownProps.match.params.statementId
  if (!statementId) {
    logger.error('Missing required statementId')
    return {}
  }
  const statement = state.entities.statements[statementId]

  const statementEditorState = get(state, ['editors', EditorTypes.STATEMENT, statementJustificationsPage_statementEditor_editorId])

  const isFetchingStatement = get(statementEditorState, 'isFetching')
  const didFetchingStatementFail = get(statementEditorState, ['errors', 'hasErrors'], false)
  const isEditingStatement = !!get(statementEditorState, ['editEntity'])

  let justifications = denormalize(state.entities.justificationsByRootStatementId[statementId], justificationsSchema, state.entities)
  justifications = sortJustifications(justifications)

  const newJustificationDialogEditorState = get(state.editors, [
    EditorTypes.NEW_JUSTIFICATION,
    statementJustificationsPage_newJustificationDialog_newJustificationEditor_editorId
  ], {})
  const isSavingNewJustification = newJustificationDialogEditorState.isSaving

  const isWindowNarrow = get(state, ['ui', 'app', 'isWindowNarrow'])

  return {
    ...state.ui.statementJustificationsPage,
    statementId,
    statement: denormalize(statement, statementSchema, state.entities),
    justifications,
    isSavingNewJustification,
    isFetchingStatement,
    isEditingStatement,
    didFetchingStatementFail,
    isWindowNarrow,
  }
}

export default connect(mapStateToProps, mapActionCreatorGroupToDispatchToProps({
  api,
  ui,
  editors,
  goto,
  flows,
}))(StatementJustificationsPage)
