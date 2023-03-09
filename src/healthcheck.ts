import { Check, CheckOptions } from './check'
import { Executor } from './executors'
import * as Status from './status'
import { HealthResponse, ChecksObject } from './schema'

export interface HealthCheckOptions {
  info?: Omit<HealthResponse, 'status' | 'checks'>
}

export class HealthCheck<T extends unknown[] = unknown[]> {
  checks: Record<string, Check<T>> = {}
  info: Omit<HealthResponse, 'status' | 'checks'>

  constructor (options?: HealthCheckOptions)
  constructor (checks?: Array<CheckOptions | Check<T>>, options?: HealthCheckOptions)
  constructor (checks?: Array<CheckOptions | Check<T>> | HealthCheckOptions, config?: HealthCheckOptions) {
    if (Array.isArray(checks)) {
      for (const options of checks) {
        const check = options instanceof Check ? options : Check.from<T>(options)
        this.add(check)
      }
      this.info = config?.info ?? {}
    } else {
      this.info = checks?.info ?? {}
    }
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
    if (name instanceof Check) {
      check = name
    } else {
      if (metric == null) throw TypeError(`Missing metric in health check ${name}`)
      if (executor == null) throw TypeError(`Missing executor in health check ${name}`)
      check = new Check(name, metric, executor)
    }
    this.checks[check.key] = check
    return this
  }

  exists (check: Check<T>): boolean
  exists (name: string, metric: string): boolean
  exists (name: Check<T> | string, metric?: string): boolean {
    const key = name instanceof Check ? name.key : name + (metric != null ? `:${metric}` : '')
    return Object.hasOwnProperty.call(this.checks, key)
  }

  delete (check: Check<T>): this
  delete (name: string, metric: string): this
  delete (name: Check<T> | string, metric?: string): this {
    const key = name instanceof Check ? name.key : name + (metric != null ? `:${metric}` : '')
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
