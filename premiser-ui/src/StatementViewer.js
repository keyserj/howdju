import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'
import cn from 'classnames'
import moment from 'moment'

import paths from './paths'
import config from './config'

export default function StatementViewer(props) {
  const {
    id,
    statement,
    className,
    showStatusText,
    ...rest,
  } = props

  const age = statement.created ? moment(statement.created).fromNow() : ''
  const created = statement.created ? moment(statement.created).format(config.humanDateTimeFormat) : ''

  return (
    <div
      {...rest}
      id={id}
      className={cn(className, "statement-viewer")}
    >
      {statement && (
        <div>
          <div className="statement-text">
            <Link to={paths.statement(statement)}>
              {statement.text}
            </Link>
          </div>
          {showStatusText && (
            <div className="entity-status-text">
              created <span title={created}>{age}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
StatementViewer.propTypes = {
  statement: PropTypes.object,
}
StatementViewer.defaultprops = {
  showStatusText: true,
}
