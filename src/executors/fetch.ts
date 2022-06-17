import fetch, { RequestInfo, RequestInit } from 'node-fetch'
import { Check } from '../check'
import * as Status from '../status'
import { Executor } from './executor'

export function fetchExecutorFactory (...requests: Array<RequestInfo | [RequestInfo, RequestInit]>): Executor<[]> {
  const endpoints: [RequestInfo, RequestInit?][] = requests.map((req) => Array.isArray(req) ? req : [req])
  return async function fetchExecutor (this: Check<[]>) {
    const responses = await Promise.all(endpoints.map(async ([info, init]) => await fetch(info, init)))
    return responses.map(response => ({ status: response.ok ? Status.Text.PASS : Status.Text.FAIL }))
  }
}
