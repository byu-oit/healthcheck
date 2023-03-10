import { type Static, Type } from '@sinclair/typebox'
import * as Status from '../status'
import { TLinksObject } from './links'

export const TComponent = Type.Object({
  componentId: Type.Optional(Type.String()),
  componentType: Type.Optional(Type.String()),
  observedValue: Type.Optional(Type.Unknown()),
  observedUnit: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(Status.Text)),
  affectedEndpoints: Type.Optional(Type.Array(Type.String())),
  time: Type.Optional(Type.Number()),
  output: Type.Optional(Type.String()),
  links: Type.Optional(TLinksObject)
}, { $id: 'CheckObject', additionalProperties: true })

export type Component = Static<typeof TComponent>

export const TComponents = Type.Array(TComponent)

export type Components = Static<typeof TComponents>

export const TChecksObject = Type.Record(
  Type.String(),
  TComponents,
  { $id: 'ChecksObject' }
)

export type ChecksObject = Static<typeof TChecksObject>
