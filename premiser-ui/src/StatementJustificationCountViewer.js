import React from 'react'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

import {
  JustificationPolarity
} from 'howdju-common'

export default function StatementJustificationCountViewer(props) {
  const {
    statement
  } = props
  const rootJustificationCountByPolarity = statement.rootJustificationCountByPolarity

  const positiveJustificationCount = get(rootJustificationCountByPolarity, JustificationPolarity.POSITIVE, 0)
  const negativeJustificationCount = get(rootJustificationCountByPolarity, JustificationPolarity.NEGATIVE, 0)
  return isEmpty(rootJustificationCountByPolarity) ? (
    <span title="no justifications">
      (0)
    </span>
  ) : (
    <span title={`${positiveJustificationCount} supporting justifications; ${negativeJustificationCount} opposing justifications`}>
      ({positiveJustificationCount}+/{negativeJustificationCount}-)
    </span>
  )
}