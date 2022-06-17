import fetch, { Response } from 'node-fetch'
import { Check, Status } from '../src'
import { fetchExecutorFactory, noopExecutorFactory } from '../src/executors'

// Mocking node fetch: https://stackoverflow.com/a/68379449/7542561
jest.mock('node-fetch', () => jest.fn())
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

test('fetch executor returns a component response', () => {
  mockFetch.mockResolvedValue({ ok: true } as Response)
  const check = new Check('fetch', 'executor',  fetchExecutorFactory(
    'https://example.com',
    ['https://example.com', { method: 'POST' }]
  ))
  expect(check.run()).resolves.toBeDefined()
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

test('noop executor returns a component response', () => {
  const check = new Check('noop', 'executor', noopExecutorFactory(Status.Text.PASS))
  expect(check.run()).resolves.toBeDefined()
})
