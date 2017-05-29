import { schema } from 'normalizr';

export const statementSchema = new schema.Entity('statements');
export const statementsSchema = [statementSchema]
export const citationReferenceSchema = new schema.Entity('citationReferences')
export const voteSchema = new schema.Entity('votes')

export const justificationTargetSchema = new schema.Union({}, (value, parent) => parent.type)
export const justificationBasisSchema = new schema.Union({
  STATEMENT: statementSchema,
  CITATION_REFERENCE: citationReferenceSchema
}, (value, parent) => parent.type)

export const justificationSchema = new schema.Entity('justifications')
justificationSchema.define({
  target: {
    entity: justificationTargetSchema
  },
  basis: {
    entity: justificationBasisSchema
  },
  counterJustifications: [justificationSchema],
  vote: voteSchema
})
// The docs say that this definition is merged, but for me it appeared to overwrite what was there.
justificationTargetSchema.define({
  STATEMENT: statementSchema,
  JUSTIFICATION: justificationSchema,
})

export const statementJustificationsSchema = {
  statement: statementSchema,
  justifications: [justificationSchema]
}