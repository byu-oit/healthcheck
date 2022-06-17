import { Static, Type } from '@sinclair/typebox'
import { Check, CheckOptions } from './check'
import { Executor } from './executors'
import * as Status from './status'


export const TComponent = Type.Object({
  componentId: Type.Optional(Type.String()),
  componentType: Type.Optional(Type.String()),
  observedValue: Type.Optional(Type.Unknown()),
  observedUnit: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(Status.Text)),
  affectedEndpoints: Type.Optional(Type.Array(Type.String())),
  time: Type.Optional(Type.Number()),
  output: Type.Optional(Type.String()),
  links: Type.Optional(Type.Record(Type.String(), Type.String({ format: 'uri' })))
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

export const TLinksObject = Type.Record(
  Type.String(),
  Type.String({ format: 'uri' }),
  { $id: 'LinksObject' }
)

export type LinksObject = Static<typeof TLinksObject>

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
})

export type HealthResponse = Static<typeof THealthResponse>

export interface HealthCheckOptions {
  info?: Omit<HealthResponse, 'status' | 'checks'>
}

export class HealthCheck<T extends unknown[] = unknown[]> {
  checks: Record<string, Check<T>> = {}
  info: Omit<HealthResponse, 'status' | 'checks'>

  constructor (checks: Array<CheckOptions | Check<T>> = [], opts: HealthCheckOptions = {}) {
    for (const options of checks) {
      const check = options instanceof Check ? options : Check.from<T>(options)
      this.add(check)
    }
    this.info = opts.info ?? {}
  }

  get length (): number {
    return Object.keys(this.checks).length
  }

  get cache (): ChecksObject {
    return Object.values(this.checks).reduce<ChecksObject>((cache, check) => {
      if (check.cache.length > 0) cache[check.key] = check.cache
      return cache
    }, {})
  }

  add (check: Check<T>): this
  add (name: string, metric: string, executor: Executor<T>): this
  add (name: string | Check<T>, metric?: string, executor?: Executor<T>): this {
    let check: Check<T>
    if(name instanceof Check) {
      check = name
    } else {
      if (metric == null || executor == null) {
        throw TypeError(`Cannot add an incomplete health check: name[${name}], metric[${metric}], executor[${executor}].`)
      }
      check = new Check(name, metric, executor)
    }
    this.checks[check.key] = check
    return this
  }

  exists (check: Check<T>): boolean
  exists (name: string, metric: string): boolean
  exists (name: Check<T> | string, metric?: string): boolean {
    const key = name instanceof Check ? name.key : `${name}:${metric}`
    return Object.hasOwnProperty.call(this.checks, key)
  }

  delete (check: Check<T>): this
  delete (name: string, metric: string): this
  delete (name: Check<T> | string, metric?: string): this {
    const key = name instanceof Check ? name.key : `${name}:${metric}`
    const { [key]: removed, ...filtered } = this.checks
    this.checks = filtered
    return this
  }

  status (): Status.Text {
    let overall = Status.Num.PASS
    for (const key in this.cache) {
      const worse = this.cache[key].find(node => node.status != null && Status.toNum(node.status) > overall)
      if (worse?.status !== undefined) {
        overall = Status.toNum(worse.status)
        if (overall === Status.Num.FAIL) {
          // Exit loop early since a fail status is the worst rank
          break
        }
      }
    }
    return Status.toText(overall)
  }

  async run (...args: T): Promise<HealthResponse> {
    await Promise.all(Object.values(this.checks)
      .map(async check => await check.run(...args)))
    return {
      ...this.info,
      status: this.status(),
      checks: this.cache
    }
  }
}
