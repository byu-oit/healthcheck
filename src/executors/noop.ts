import type { Executor } from './executor'
import type { Check } from '../check'
import type * as Status from '../status'

export function noopExecutorFactory (status: Status.Text): Executor<[]> {
  return async function noopExecutor (this: Check<[]>) {
    return [{ status }]
  }
}
