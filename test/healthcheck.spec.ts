import { HealthCheck, noopExecutorFactory, Text, AjvError } from '../src'

let healthCheck: HealthCheck

beforeEach(() => {
  healthCheck = new HealthCheck()
    .add('test', 'noop', noopExecutorFactory(Text.PASS))
})

test('can add and delete checks', () => {
  healthCheck.add('dumb', 'addition', noopExecutorFactory(Text.FAIL))
  expect(healthCheck.exists('dumb', 'addition')).toBeTruthy()
  healthCheck.delete('dumb', 'addition')
  expect(healthCheck.exists('dumb', 'addition')).toBeFalsy()
})

test('can run checks', async () => {
  // We do not need to check the shape of the response, only that it resolves
  // It should reject if the response is formatted incorrectly
  await expect(healthCheck.run()).resolves.toBeDefined()
})
