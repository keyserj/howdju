import React, {Component} from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import map from 'lodash/map'

import JustificationBasisCompoundViewerAtomItem from "./JustificationBasisCompoundViewerAtomItem"
import {logger} from './logger'
import config from './config'
import {
  combineIds
} from './viewModels'

import './JustificationBasisCompoundViewer.scss'

export default class JustificationBasisCompoundViewer extends Component {

  render() {
    const {
      id,
      justificationBasisCompound,
      doShowControls,
      doShowStatementAtomJustifications,
      isCondensed,
      isUnCondensed,
      showStatusText,
      showUrls,
      trailStatements,
    } = this.props

    const atoms = get(justificationBasisCompound, 'atoms', [])
    if (atoms.length < 1 && config.isDev) {
      logger.warn(`JustificationBasisCompound ${justificationBasisCompound.id}'s atoms are empty`)
    }

    return (
      <ol className="compound-viewer justification-basis-compound-viewer">
        {map(atoms, atom => {
          const atomId = combineIds(id, `atom-${atom.id}`)
          return (
            <JustificationBasisCompoundViewerAtomItem
              atom={atom}
              id={atomId}
              key={atomId}
              doShowControls={doShowControls}
              doShowStatementAtomJustifications={doShowStatementAtomJustifications}
              isCondensed={isCondensed}
              isUnCondensed={isUnCondensed}
              showStatusText={showStatusText}
              showUrls={showUrls}
              trailStatements={trailStatements}
            />
          )
        })}
      </ol>
    )
  }
}
JustificationBasisCompoundViewer.propTypes = {
  id: PropTypes.string.isRequired,
  justificationBasisCompound: PropTypes.object.isRequired,
  doShowControls: PropTypes.bool,
  doShowStatementAtomJustifications: PropTypes.bool,
  isCondensed: PropTypes.bool,
  isUnCondensed: PropTypes.bool,
}
JustificationBasisCompoundViewer.defaultProps = {
  doShowControls: true,
  doShowStatementAtomJustifications: false,
  isCondensed: false,
  isUnCondensed: false,
}