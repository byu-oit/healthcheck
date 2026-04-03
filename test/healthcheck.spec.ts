import { HealthCheck, Status } from '../src'
import { Check } from '../src/check'
import { noopExecutorFactory } from '../src/executors/noop'

let healthCheck: HealthCheck

beforeEach(() => {
  healthCheck = new HealthCheck()
    .add('test', 'noop', noopExecutorFactory(Status.Text.PASS))
})

test('can add and delete checks', () => {
  healthCheck.add('dumb', 'addition', noopExecutorFactory(Status.Text.FAIL))
  expect(healthCheck.exists('dumb', 'addition')).toBeTruthy()
  healthCheck.delete('dumb', 'addition')
  expect(healthCheck.exists('dumb', 'addition')).toBeFalsy()
})

test('can run checks', async () => {
  // We do not need to check the shape of the response, only that it resolves
  // It should reject if the response is formatted incorrectly
  await expect(healthCheck.run()).resolves.toBeDefined()
})

test('can be constructed from check options and exposes cached results', async () => {
  const configured = new HealthCheck([
    {
      name: 'configured',
      metric: 'check',
      executor: noopExecutorFactory(Status.Text.PASS)
    }
  ], { info: { version: '1.0.0' } })

  expect(configured.exists('configured', 'check')).toBeTruthy()
  await configured.run()
  expect(configured.cache).toHaveProperty('configured:check')
})

test('supports add and exists overloads with Check instances', () => {
  const check = new Check('instance', 'check', noopExecutorFactory(Status.Text.WARN))
  const configured = new HealthCheck().add(check)

  expect(configured.exists(check)).toBeTruthy()
  configured.delete(check)
  expect(configured.exists(check)).toBeFalsy()
})

test('throws when adding a check without required arguments', () => {
  const configured = new HealthCheck()

  expect(() => configured.add('broken')).toThrow('Missing metric in health check broken')
  expect(() => configured.add('broken', 'metric')).toThrow('Missing executor in health check broken')
})

test('status returns the worst cached state across checks', async () => {
  const configured = new HealthCheck()
    .add('pass', 'check', noopExecutorFactory(Status.Text.PASS))
    .add('warn', 'check', noopExecutorFactory(Status.Text.WARN))
    .add('fail', 'check', noopExecutorFactory(Status.Text.FAIL))

  await configured.run()

  expect(configured.status()).toBe(Status.Text.FAIL)
})
