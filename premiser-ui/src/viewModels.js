import assign from 'lodash/assign'
import cloneDeep from 'lodash/cloneDeep'
import forEach from 'lodash/forEach'

import truncate from 'lodash/truncate'

import config from './config'
import {
  JustificationBasisType,
  newExhaustedEnumError,
} from 'howdju-common'
import {ellipsis} from './characters'


export const removeStatementCompoundId = (statementCompound) => {
  if (!statementCompound) return statementCompound
  delete statementCompound.id
  forEach(statementCompound.atoms, atom => {
    delete atom.compoundId
  })
  return statementCompound
}

export const consolidateNewJustificationBasis = (newJustification) => {
  const justification = cloneDeep(newJustification)
  switch (justification.basis.type) {
    case JustificationBasisType.STATEMENT_COMPOUND:
      justification.basis.entity = justification.basis.statementCompound
      break
    case JustificationBasisType.WRIT_QUOTE:
      justification.basis.entity = justification.basis.writQuote
      break
    case JustificationBasisType.JUSTIFICATION_BASIS_COMPOUND:
      justification.basis.entity = justification.basis.justificationBasisCompound
      break
    default:
      throw newExhaustedEnumError('JustificationBasisType', justification.basis.type)
  }
  delete justification.basis.statementCompound
  delete justification.basis.writQuote
  delete justification.basis.justificationBasisCompound

  return justification
}

export const justificationBasisTypeToNewJustificationBasisMemberName = (justificationBasisType) => {
  const newJustificationBasisMemberNames = {
    [JustificationBasisType.STATEMENT_COMPOUND]: 'statementCompound',
    [JustificationBasisType.WRIT_QUOTE]: 'writQuote',
    [JustificationBasisType.JUSTIFICATION_BASIS_COMPOUND]: 'justificationBasisCompound',
  }
  const newJustificationBasisMemberName = newJustificationBasisMemberNames[justificationBasisType]
  if (!newJustificationBasisMemberName) {
    throw newExhaustedEnumError('JustificationBasisType', justificationBasisType)
  }
  return newJustificationBasisMemberName
}


const truncateOptions = {
  length: config.ui.shortTextLength,
  omission: ellipsis,
  separator: /[,.]*\s+/,
}
export const isTextLong = (text) => text ? text.length > config.ui.shortTextLength : false
export const truncateWritQuoteText = (quoteText, options) => truncate(quoteText, assign({}, truncateOptions, options))
export const truncateStatementText = (text, options) => truncate(text, assign({}, truncateOptions, options))
