import { FastifyPluginCallback, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import fp from 'fastify-plugin'
import { HealthCheck } from '../healthcheck'

export interface FastifyRfcHealthCheckOptions {
  path?: string
  method?: HTTPMethods
  cacheControl?: Record<string, string>
  healthCheck: HealthCheck<[FastifyRequest?]>
}

const plugin: FastifyPluginCallback<FastifyRfcHealthCheckOptions> = (fastify, options) => {
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
}

export const healthCheckFastify = fp(plugin, {
  fastify: '>=3',
  name: '@byu-oit/healthcheck'
})
