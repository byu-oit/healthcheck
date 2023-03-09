import fastify, {FastifyRequest} from 'fastify'
import {HealthCheck, Status} from '../../src'
import {noopExecutorFactory} from '../../src/executors/noop'
import {healthCheckFastify} from '../../src/plugins/fastify'

const healthCheck = new HealthCheck<[FastifyRequest?]>({info: {version: '1', releaseId: '1.2.2'}})
    .add('noop', 'alive', noopExecutorFactory(Status.Text.PASS))

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
