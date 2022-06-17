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

```shell
npm install @byu-oit/healthcheck
```

## Usage

### Fastify

Health check executors and their dependencies can be imported from external files for better code organization. For
demonstration purposes, I've included all the pieces in a comprehensive example below:

```typescript
// server.ts
import { HealthCheck, Status } from '@byu-oit/healthcheck'
import { healthCheckFastify } from '@byu-oit/healthcheck/dist/plugins/fastify'
import { FastifyRequest } from 'fastify'
import { Client } from 'pg'

const healthCheck = new HealthCheck({ version: '1', releaseId: '1.2.2' })
  .add('postgresql', 'connections', async (req: FastifyRequest) => {
    try {
      // Gets connection information from environment
      await new Client().query('SELECT NOW()')
      return { status: Status.Text.PASS }
    } catch (e) {
      return { status: Status.Text.FAIL }
    }
  })

void api.register(healthCheckFastify, {
  logLevel: 'error', // Disable health check logging except for errors
  path: '/health',
  // method: 'GET', // Default method is GET
  healthCheck
})
```

Rather than calling the `add` function, the above example could be changed to pass in the check options in the
HealthCheck constructor like so:

```typescript
import { HealthCheck } from './healthcheck'

const healthCheck = new HealthCheck([
  {
    name: 'postgreseql',
    metric: 'connections',
    async executor (req: FastifyRequest) {
      return { status: Status.Text.PASS }
    }
  }
], { version: '1', releaseId: '1.2.2' })
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
dependencies must be installed.

### Executor Factories

Executor Factories assist in replicating common patterns for checking system statuses. like plugins, must be imported
directly and require all their dependencies (if any) to be installed.

| Executor             | Import Path                               | Dependencies               | Description                                                                                                                                                                                  |
|----------------------|-------------------------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| noopExecutorFactory  | @byu-oit/healthcheck/dist/executors/noop  | None                       | An executor for testing purposes.                                                                                                                                                            |
| fetchExecutorFactory | @byu-oit/healthcheck/dist/executors/fetch | `npm install node-fetch@2` | Pass in node-fetch configurations to make HTTP requests. Status Codes 2xx and 3xx will set a status of 'pass' in the health check. Any other status codes will result in a status of 'fail'. |
