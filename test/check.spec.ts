import { Check, noopExecutorFactory, Text } from '../src'

function sleep (ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

let success: Check
let warn: Check
let fail: Check

beforeEach(() => {
  success = new Check('success', 'check', noopExecutorFactory(Text.PASS), { minCache: 10})
  warn = new Check('warn', 'check', noopExecutorFactory(Text.WARN), { minCache: 10})
  fail = new Check('fail', 'check', noopExecutorFactory(Text.FAIL), { minCache: 10})
})

test('check can cache results', async () => {
  expect(success.hasCache()).toBeFalsy()
  await success.run()
  expect(success.hasCache()).toBeTruthy()
})

test('check returns cached results for passed checks', async () => {
  const first = await success.run()
  await sleep(10)
  const second = await success.run()
  expect(success.expired().length).toBeFalsy()
  expect(success.passed().length).toBeTruthy()
  expect(first[0].time).toEqual(second[0].time)
})

test('check returns cached results for warned checks', async () => {
  const first = await warn.run()
  await sleep(10)
  const second = await warn.run()
  expect(warn.expired().length).toBeFalsy()
  expect(warn.warned().length).toBeTruthy()
  expect(first[0].time).toEqual(second[0].time)
})

test('check returns new results for failed checks', async () => {
  const first = await fail.run()
  await sleep(10)
  const second = await fail.run()
  expect(fail.expired().length).toBeFalsy()
  expect(fail.failed().length).toBeTruthy()
  expect(first[0].time).not.toEqual(second[0].time)
})
