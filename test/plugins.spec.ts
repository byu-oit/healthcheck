import fastify, { type FastifyRequest } from 'fastify'
import { HealthCheck, Status, healthCheckFastify, noopExecutorFactory } from '../src'

test('fastify plugin registers the health route and returns the expected headers', async () => {
  const app = fastify()
  const healthCheck = new HealthCheck<[FastifyRequest?]>({
    info: {
      version: '1',
      releaseId: '1.2.3'
    }
  }).add('noop', 'alive', noopExecutorFactory(Status.Text.PASS))

  await app.register(healthCheckFastify, {
    path: '/health/details',
    method: 'GET',
    cacheControl: {
      'max-age': '60',
      staleWhileRevalidate: '30'
    },
    healthCheck
  })

  const response = await app.inject({
    method: 'GET',
    url: '/health/details'
  })

  expect(response.statusCode).toBe(200)
  expect(response.headers['content-type']).toContain('application/health+json')
  expect(response.headers['cache-control']).toBe('max-age=60, staleWhileRevalidate=30')
  expect(response.json()).toEqual({
    version: '1',
    releaseId: '1.2.3',
    status: 'pass',
    checks: {
      'noop:alive': [
        expect.objectContaining({
          status: 'pass',
          time: expect.any(Number)
        })
      ]
    }
  })

  await app.close()
})

test('fastify plugin uses default path and cache control headers', async () => {
  const app = fastify()
  const healthCheck = new HealthCheck<[FastifyRequest?]>()
    .add('noop', 'alive', noopExecutorFactory(Status.Text.PASS))

  await app.register(healthCheckFastify, { healthCheck })

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  })

  expect(response.statusCode).toBe(200)
  expect(response.headers['cache-control']).toBe('max-age=3600')

  await app.close()
})
