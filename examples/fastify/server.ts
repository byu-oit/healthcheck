import fastify, {FastifyRequest} from 'fastify'
import {HealthCheck, Status} from '../../src'
import {noopExecutorFactory} from '../../src/executors/noop'
import {healthCheckFastify} from '../../src/plugins/fastify'

const healthCheck: HealthCheck<[FastifyRequest?]> = new HealthCheck([
    {
        name: 'noop',
        metric: 'alive',
        executor: noopExecutorFactory(Status.Text.PASS)
    }
], {info: {version: '1', releaseId: '1.2.2'}})

export const app = fastify()

app.register(healthCheckFastify, {
    logLevel: 'error',
    path: '/health/details',
    healthCheck
})

if (require.main === module) {
    ;(async () => {
        try {
            const port = 3000
            await app.listen({port})
            console.info(`Started listening on port ${port}`)
        } catch (e) {
            console.error(e)
        }
    })()
}
