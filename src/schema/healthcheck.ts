import { type Static, Type } from '@sinclair/typebox'
import * as Status from '../status'
import { TChecksObject } from './check'
import { TLinksObject } from './links'

export const THealthResponse = Type.Object({
  status: Type.Enum(Status.Text),
  version: Type.Optional(Type.String()),
  releaseId: Type.Optional(Type.String()),
  notes: Type.Optional(Type.Array(Type.String())),
  output: Type.Optional(Type.String()),
  checks: Type.Optional(TChecksObject),
  links: Type.Optional(TLinksObject),
  serviceId: Type.Optional(Type.String()),
  description: Type.Optional(Type.String())
}, { $id: 'HealthResponse', additionalProperties: true })

export type HealthResponse = Static<typeof THealthResponse>
