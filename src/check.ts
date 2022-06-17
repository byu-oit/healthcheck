import { Validator } from './validator'
import * as Status from './status'
import { Static, Type } from '@sinclair/typebox'
import { Executor } from './executors'
import { Components, TComponents } from './schema'

export const TCheckOptions = Type.Object({
  name: Type.String(),
  metric: Type.String(),
  executor: Type.Any(),
  opts: Type.Optional(Type.Object({
    minCache: Type.Optional(Type.Number())
  }))
}, { $id: 'CheckOptions', additionalProperties: true })

export type CheckOptions = Static<typeof TCheckOptions>

export class Check<T extends unknown[] = unknown[]> {
  readonly key: string
  readonly minCache: number
  private cached: Components = []
  private readonly validate = new Validator(TComponents)

  constructor (
    readonly name: string,
    readonly metric: string,
    private readonly executor: Executor<T>,
    opts: CheckOptions['opts'] = {}
  ) {
    this.key = `${name}:${metric}`
    this.minCache = (opts.minCache ?? 0) * 1000 // milliseconds to seconds
  }

  static from<T extends unknown[] = unknown[]> (value: unknown): Check<T> {
    const parsed = new Validator(TCheckOptions).parse(value)
    const { name, metric, executor, opts } = parsed
    return new Check(name, metric, executor, opts)
  }

  get cache (): Components {
    return this.cached
  }

  clearCache (): this {
    this.cached.length = 0
    return this
  }

  hasCache (): boolean {
    return this.cached.length > 0
  }

  expired (): Components {
    return this.cached.filter(node => {
      if (node.time === undefined) return false
      const now = Date.now()
      const expiresAt = node.time + this.minCache
      return now > expiresAt
    })
  }

  failed (): Components {
    return this.withStatus(Status.Text.FAIL)
  }

  warned (): Components {
    return this.withStatus(Status.Text.WARN)
  }

  passed (): Components {
    return this.withStatus(Status.Text.PASS)
  }

  async run (...args: T): Promise<Components> {
    if (!this.hasCache() || this.expired().length > 0 || this.failed().length > 0) {
      const res = await this.executor(...args)
      const time = Date.now() // set the cache time in ms
      this.cached = this.validate.parse(res.map((v: any) => ({ ...v, time })))
    }
    return this.cached
  }

  private withStatus (status: Status.Text): Components {
    return this.cached.filter(node => node.status !== undefined && node.status === status)
  }
}
