# @byu-oit/healthcheck

Standardized web server health checks

## Motivation

The Health Check Response RFC Draft for HTTP APIs establishes a standard model for health check responses. Some
implementations of the RFC Draft already exist in Node.js, however, none provide a standard interface for implementing
and running executors. This library aims at standardizing how Node.js developers create and run health checks within
their web servers.

## Terminology

An overview of the terminology used in the code base. More specific RFC Draft information can be found
at: [https://inadarei.github.io/rfc-healthcheck](https://inadarei.github.io/rfc-healthcheck).

**health check**: An REST response used to determine the overall health of a web server. It contains a map of
component keys and component responses. In the RFC Draft, this is also known as the Checks Object. For additional
information about the information that a health check response may contain, please see the published RFC Draft.

**component key**: a component has a name and a metric associated with it. The name and metric make up what is known as
the component key and are formatted `{name}:{metric}`. The metric portion of the key is optional and if omitted, the
name will be the key.

**component** or **check**: a section of the health check response containing information about the status of
infrastructure that the web server depends on. For more information about what a component response contains, please
refer to the published RFC Draft.

**executor**: a function used to establish the status of a component. The returned value must be in the shape of a
component response object as defined per the RFC Draft.

## Installation

This package now targets `Node.js 20+`.

```shell
npm install @byu-oit/healthcheck
```

If you use the Fastify plugin, install a Fastify 5 release:

```shell
npm install @byu-oit/healthcheck fastify@^5
```

## Breaking Changes

- `@byu-oit/healthcheck` now requires `Node.js 20+`.
- The Fastify integration is now intended for `fastify@^5`.
- The documented executor deep-import paths remain unchanged:
  - `@byu-oit/healthcheck/dist/executors/noop`
  - `@byu-oit/healthcheck/dist/executors/fetch`

## Usage

### Fastify

Health check executors and their dependencies can be imported from external files for better code organization. The
example below targets Fastify 5:

```typescript
// server.ts
import {HealthCheck, Status, healthCheckFastify, noopExecutorFactory} from '@byu-oit/healthcheck'
import {FastifyRequest} from 'fastify'

const healthCheck = new HealthCheck<[FastifyRequest?]>({info: {version: '1', releaseId: '1.2.2'}})
    .add('noop', 'alive', noopExecutorFactory(Status.Text.PASS))

export const app = fastify()

app.register(healthCheckFastify, {
    logLevel: 'error',
    path: '/health/details',
    healthCheck
})
```

Rather than calling the `add` function, the above example could be changed to pass in the check options in the
HealthCheck constructor like so:

```typescript
import {FastifyRequest, Status} from 'fastify'
import {HealthCheck} from '@byu-oit/healthcheck'

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
```

The RFC Draft allows metadata on the top level of the health check response. More information about the top-level
metadata can be found on the RFC Draft website. Here is an example of passing in all the allowed top-level metadata.

```typescript
const healthCheck = new HealthCheck({
    info: {
        version: "1",
        releaseId: "1.2.2",
        notes: [""],
        output: "",
        serviceId: "f03e522f-1f44-4062-9b55-9587f91c9c41",
        description: "health of authz service",
        links: {
            about: "http://api.example.com/about/authz",
            'http://api.x.io/rel/thresholds': "http://api.x.io/rel/thresholds"
        }
    }
})
```

### Plugins

Plugins or middleware are implementations of the RFC Draft for specific web server frameworks such as fastify. Plugins
must be imported directly to not bloat the required dependencies to run this package. Additionally, all plugin
dependencies must be installed, and the Fastify plugin assumes a Fastify 5 application.

### Executor Factories

Executor Factories assist in replicating common patterns for checking system statuses. like plugins, must be imported
directly and require all their dependencies (if any) to be installed.

| Executor             | Import Path                               | Dependencies               | Description                                                                                                                                                                                  |
|----------------------|-------------------------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| noopExecutorFactory  | @byu-oit/healthcheck/dist/executors/noop  | None                       | An executor for testing purposes.                                                                                                                                                            |
| fetchExecutorFactory | @byu-oit/healthcheck/dist/executors/fetch | `npm install node-fetch@2` | Pass in node-fetch configurations to make HTTP requests. Status Codes 2xx and 3xx will set a status of 'pass' in the health check. Any other status codes will result in a status of 'fail'. |
