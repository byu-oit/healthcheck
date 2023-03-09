import fastify, { FastifyRequest } from 'fastify'
import { HealthCheck, Status, noopExecutorFactory, healthCheckFastify } from '../../src'

const healthCheck = new HealthCheck<[FastifyRequest?]>({ info: { version: '1', releaseId: '1.2.2' } })
  .add('noop', 'alive', noopExecutorFactory(Status.Text.PASS))

export const app = fastify()

void app.register(healthCheckFastify, {
  logLevel: 'error',
  path: '/health/details',
  healthCheck
})

if (require.main === module) {
  void (async () => {
    try {
      const port = 3000
      await app.listen({ port })
      console.info(`Started listening on port ${port}`)
    } catch (e) {
      console.error(e)
    }
  })()
}
