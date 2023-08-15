import type { FastifyPluginCallback, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import type { HealthCheck } from '../healthcheck'

export interface FastifyRfcHealthCheckOptions {
  path?: string
  method?: HTTPMethods
  cacheControl?: Record<string, string>
  healthCheck: HealthCheck<[FastifyRequest?]>
}

export const healthCheckFastify: FastifyPluginCallback<FastifyRfcHealthCheckOptions> = (fastify, options, done) => {
  const url = options?.path ?? '/health'
  const method = options?.method ?? 'GET'
  const cacheControl = Object.entries(options?.cacheControl ?? { 'max-age': '3600' })
    .map(([name, value]) => `${name}=${value}`).join(', ')
  const healthCheck = options.healthCheck

  async function handler (req: FastifyRequest, reply: FastifyReply): Promise<void> {
    req.log.debug(`evaluating ${healthCheck.length} checks`)
    const response = await healthCheck.run(req)
    await reply
      .header('Content-Type', 'application/health+json')
      .header('Cache-Control', cacheControl)
      .send(response)
  }

  fastify.route({ method, url, handler })
  done()
}
