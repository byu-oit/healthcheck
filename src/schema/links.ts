import { Static, Type } from '@sinclair/typebox'

export const TLinksObject = Type.Record(
  Type.String(),
  Type.String({ format: 'uri' }),
  { $id: 'LinksObject' }
)

export type LinksObject = Static<typeof TLinksObject>
