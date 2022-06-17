import { Executor } from './executor'
import { Check } from '../check'
import * as Status from '../status'

export function noopExecutorFactory (status: Status.Text): Executor<[]> {
  return async function noopExecutor (this: Check<[]>) {
    return [{ status }]
  }
}
