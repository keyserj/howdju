import React, {Component} from "react";
import {connect} from "react-redux";
import {denormalize} from "normalizr";
import DocumentTitle from "react-document-title";
import Divider from "react-md/lib/Dividers";
import Card from "react-md/lib/Cards/Card";
import FontIcon from "react-md/lib/FontIcons";
import MenuButton from "react-md/lib/Menus/MenuButton";
import ListItem from "react-md/lib/Lists/ListItem";
import Dialog from 'react-md/lib/Dialogs'
import Positions from "react-md/lib/Menus/Positions";
import Button from 'react-md/lib/Buttons'
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import toNumber from "lodash/toNumber";
import isFinite from "lodash/isFinite";
import forEach from 'lodash/forEach';
import some from 'lodash/some'
import defaults from 'lodash/defaults'
import classNames from 'classnames'
import FlipMove from 'react-flip-move';
import get from 'lodash/get'

import config from './config';

import {logError} from "./util";
import {
  isVerified,
  isDisverified,
  JustificationPolarity,
  isPositive,
  isNegative,
  makeNewJustification, JustificationTargetType, JustificationBasisType, consolidateBasis,
} from "./models";

import {
  api,
  editors, mapActionCreatorGroupToDispatchToProps,
  ui,
  goto, flows,
} from "./actions";
import {justificationSchema, statementSchema} from "./schemas";
import JustificationWithCounters from './JustificationWithCounters'
import text, {
  ADD_JUSTIFICATION_CALL_TO_ACTION,
  CANCEL_BUTTON_LABEL,
  CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL, FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE
} from "./texts";
import JustificationEditor from './JustificationEditor'

import "./StatementJustificationsPage.scss";
import {
  statementJustificationsPageStatementEditorId,
  statementJustificationsPageNewJustificationEditorId
} from "./editorIds";
import {EditorTypes} from "./reducers/editors";
import EditableStatement from "./EditableStatement";

class StatementJustificationsPage extends Component {
  constructor() {
    super()
    this.state = {
      isOverStatement: false,
    }

    this.statementEditorId = statementJustificationsPageStatementEditorId
    this.newJustificationEditorId = statementJustificationsPageNewJustificationEditorId

    this.onStatementMouseOver = this.onStatementMouseOver.bind(this)
    this.onStatementMouseLeave = this.onStatementMouseLeave.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.onEditStatement = this.onEditStatement.bind(this)
    this.deleteStatement = this.deleteStatement.bind(this)
    this.onUseStatement = this.onUseStatement.bind(this)

    this.showNewJustificationDialog = this.showNewJustificationDialog.bind(this)
    this.onNewJustificationPropertyChange = this.onNewJustificationPropertyChange.bind(this)
    this.addNewJustificationUrl = this.addNewJustificationUrl.bind(this)
    this.deleteNewJustificationUrl = this.deleteNewJustificationUrl.bind(this)
    this.saveNewJustification = this.saveNewJustification.bind(this)
    this.onSubmitNewJustificationDialog = this.onSubmitNewJustificationDialog.bind(this)
    this.cancelNewJustificationDialog = this.cancelNewJustificationDialog.bind(this)
  }

  componentWillMount() {
    this.props.api.fetchStatementJustifications(this.props.match.params.statementId)
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  onStatementMouseOver() {
    this.setState({isOverStatement: true})
  }

  onStatementMouseLeave() {
    this.setState({isOverStatement: false})
  }

  updateDimensions() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
  }

  onEditStatement() {
    this.props.editors.beginEdit(EditorTypes.STATEMENT, this.statementEditorId, this.props.statement)
  }

  onUseStatement() {
    this.props.goto.createJustification(JustificationBasisType.STATEMENT, this.props.match.params.statementId)
  }

  deleteStatement() {
    this.props.api.deleteStatement(this.props.statement)
  }

  showNewJustificationDialog(e) {
    e.preventDefault()

    const statementId = this.props.match.params.statementId
    const newJustification = makeNewJustification({
      rootStatementId: statementId,
      target: { type: JustificationTargetType.STATEMENT, entity: { id: statementId } }
    })
    this.props.editors.beginEdit(EditorTypes.JUSTIFICATION, this.newJustificationEditorId, newJustification)

    this.props.ui.showNewJustificationDialog(statementId)
  }

  onNewJustificationPropertyChange(properties) {
    this.props.editors.propertyChange(EditorTypes.JUSTIFICATION, this.newJustificationEditorId, properties)
  }

  addNewJustificationUrl() {
    this.props.editors.addUrl(EditorTypes.JUSTIFICATION, this.newJustificationEditorId)
  }

  deleteNewJustificationUrl(url, index) {
    this.props.editors.deleteUrl(EditorTypes.JUSTIFICATION, this.newJustificationEditorId, url, index)
  }

  onSubmitNewJustificationDialog(e) {
    e.preventDefault()
    this.saveNewJustification()
  }

  saveNewJustification() {
    const justification = consolidateBasis(this.props.newJustification)
    this.props.flows.createJustificationThenPutActionIfSuccessful(justification, ui.hideNewJustificationDialog())
  }

  cancelNewJustificationDialog() {
    this.props.ui.hideNewJustificationDialog()
  }

  render () {
    const {
      statement,
      justifications,
      isFetching,
      didFail,
      isNewJustificationDialogVisible,
      newJustificationErrorMessage,
      isCreatingNewJustification,
      newJustification,
      match: {params: {statementId} }
    } = this.props

    const {narrowBreakpoint, flipMoveDuration, flipMoveEasing} = config.ui.statementJustifications

    const errorMessage = didFail ? text(FETCH_STATEMENT_JUSTIFICATIONS_FAILURE_MESSAGE) : ''

    const isNarrow = this.state.width <= narrowBreakpoint
    const defaultJustificationsByPolarity = {
      [JustificationPolarity.POSITIVE]: [],
      [JustificationPolarity.NEGATIVE]: [],
    }
    const justificationsByPolarity = isNarrow ?
        defaultJustificationsByPolarity :
        defaults(groupBy(justifications, j => j.polarity), defaultJustificationsByPolarity)


    const hasJustifications = justifications && justifications.length > 0
    const hasAgreement = some(justifications, j => isVerified(j) && isPositive(j))
    const hasDisagreement = some(justifications, j => isVerified(j) && isNegative(j))

    const statementCardClassNames = classNames({
      statementCard: true,
      agreement: hasAgreement,
      disagreement: hasDisagreement,
    })
    const menu = (
        <MenuButton
            icon
            id={`statement-${statementId}-context-menu`}
            className={classNames({hiding: !this.state.isOverStatement})}
            menuClassName="contextMenu statementContextMenu"
            buttonChildren={'more_vert'}
            position={Positions.TOP_RIGHT}
        >
          <ListItem primaryText="Add Justification"
                    leftIcon={<FontIcon>add</FontIcon>}
                    onClick={this.showNewJustificationDialog}
          />
          <ListItem primaryText="Use"
                    leftIcon={<FontIcon>call_made</FontIcon>}
                    onClick={this.onUseStatement}
          />
          <Divider />
          <ListItem primaryText="Edit"
                    leftIcon={<FontIcon>create</FontIcon>}
                    onClick={this.onEditStatement}
          />
          <ListItem primaryText="Delete"
                    leftIcon={<FontIcon>delete</FontIcon>}
                    onClick={this.deleteStatement}
          />
        </MenuButton>
    )

    const addNewJustificationDialog = (
        <Dialog id="newJustificationDialog"
                visible={isNewJustificationDialogVisible}
                title="Add justification"
                onHide={this.cancelNewJustificationDialog}
                actions={[
                  <Button flat label={text(CANCEL_BUTTON_LABEL)} onClick={this.cancelNewJustificationDialog} />,
                  <Button flat
                          primary
                          type="submit"
                          label={text(CREATE_JUSTIFICATION_SUBMIT_BUTTON_LABEL)}
                          onClick={this.saveNewJustification}
                          disabled={isCreatingNewJustification}
                  />
                ]}
        >
          <div className={classNames({
            errorMessage: true,
            hidden: !newJustificationErrorMessage
          })}>
            {newJustificationErrorMessage}
          </div>

          <form onSubmit={this.onSubmitNewJustificationDialog}>
            {newJustification &&
              <JustificationEditor justification={newJustification}
                                   onPropertyChange={this.onNewJustificationPropertyChange}
                                   onAddUrlClick={this.addNewJustificationUrl}
                                   onDeleteUrlClick={this.deleteNewJustificationUrl}
              />
            }
          </form>

        </Dialog>
    )

    const twoColumnJustifications = [
      <div key="positive-justifications" className="col-xs-6">

        <FlipMove duration={flipMoveDuration} easing={flipMoveEasing}>
          {justificationsByPolarity[JustificationPolarity.POSITIVE].map(j => (
              <div className="row" key={j.id}>
                <div className="col-xs-12">
                  <JustificationWithCounters justification={j} positivey={true} />
                </div>
              </div>
          ))}
        </FlipMove>

      </div>,
      <div key="negative-justifications" className="col-xs-6">

        <FlipMove duration={flipMoveDuration} easing={flipMoveEasing}>
          {justificationsByPolarity[JustificationPolarity.NEGATIVE].map(j => (
              <div className="row" key={j.id}>
                <div className="col-xs-12">
                  <JustificationWithCounters justification={j} positivey={false} />
                </div>
              </div>
          ))}
        </FlipMove>

      </div>
    ]
    const singleColumnJustifications = (
      <div key="justifications" className="col-xs-12">

        <FlipMove duration={flipMoveDuration} easing={flipMoveEasing}>
          {justifications.map(j => (
              <div className="row" key={j.id}>
                <div className="col-xs-12">
                  <JustificationWithCounters justification={j} positivey={isPositive(j)} />
                </div>
              </div>
          ))}
        </FlipMove>

      </div>
    )
    const justificationRows = isNarrow ? singleColumnJustifications : twoColumnJustifications

    return (
        <DocumentTitle title={`${statement ? statement.text : 'Loading statement'} - Howdju`}>
          <div className="statement-justifications">

            <div className="row">

              <div className="col-xs-12">

                <div className="statement">

                  <Card className={statementCardClassNames}
                      onMouseOver={this.onStatementMouseOver}
                      onMouseLeave={this.onStatementMouseLeave}
                  >

                    <div className="md-grid">
                      <div className="md-cell md-cell--12 statementText">

                        {statement && menu}
                        <EditableStatement id="StatementJustificationsPage-StatementEditor"
                                           entityId={statementId}
                                           editorId={statementJustificationsPageStatementEditorId} />

                      </div>
                    </div>

                  </Card>

                </div>

              </div>
            </div>

            {errorMessage &&
                <div className="row center-xs">
                  <div className="col-xs-12 errorMessage">
                    {errorMessage}
                  </div>
                </div>
            }
            {!hasJustifications && !isFetching && !errorMessage &&

              <div className="row center-xs">
                <div className="col-xs-12">
                  <div>
                    <div>No justifications.</div>
                    <div>
                      <a onClick={this.showNewJustificationDialog} href="#">
                        {text(ADD_JUSTIFICATION_CALL_TO_ACTION)}
                      </a>
                    </div>

                  </div>
                </div>
              </div>
            }
            <div className="row">
              {justificationRows}
            </div>

            {addNewJustificationDialog}

          </div>

        </DocumentTitle>
    )
  }
}
StatementJustificationsPage.defaultProps = {
  isFetching: false,
  didFail: false,
  isNewJustificationDialogVisible: false,
  statement: null,
  justifications: [],
}

const sortJustifications = justifications => {
  justifications = sortBy(justifications, j => j.score)
  justifications = sortBy(justifications, j => isDisverified(j) ? 1 : isVerified(j) ? -1 : 0)
  forEach(justifications, j => {
    j.counterJustifications = sortJustifications(j.counterJustifications)
  })
  return justifications
}

const mapStateToProps = (state, ownProps) => {
  const statementId = toNumber(ownProps.match.params.statementId)
  if (!statementId) {
    logError('Missing required statementId')
    return {}
  }
  if (!isFinite(statementId)) {
    logError(`Invalid statementId: ${ownProps.match.params.statementId}`)
    return {}
  }

  let {isFetching} = state.ui.statementJustificationsPage
  const statement = state.entities.statements[statementId]
  if (!statement && !isFetching) {
    // The component may just be mounting
    return {}
  }

  let justifications = denormalize(state.entities.justificationsByRootStatementId[statementId], [justificationSchema], state.entities)
  justifications = sortJustifications(justifications)

  const {
    editEntity: newJustification,
    inProgress: isCreatingNewJustification,
  } = get(state.editors, [EditorTypes.JUSTIFICATION, statementJustificationsPageNewJustificationEditorId], {})

  return {
    ...state.ui.statementJustificationsPage,
    statement: denormalize(statement, statementSchema, state.entities),
    justifications,
    newJustification,
    isCreatingNewJustification,
  }
}

export default connect(mapStateToProps, mapActionCreatorGroupToDispatchToProps({
  api,
  ui,
  editors,
  goto,
  flows,
}))(StatementJustificationsPage)
