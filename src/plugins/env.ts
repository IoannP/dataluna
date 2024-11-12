import fastifyEnv from '@fastify/env';

import type { setupPlugin } from '../types';

const schema = {
  type: 'object',
  required: [
    'DATABASE_URL',
    'SKINPORT_API_ORIGIN_URL',
    'CACHE_URL',
    'SESSION_SECRET',
    'SESSION_SULT'
  ],
  properties: {
    PORT: {
      type: 'string',
      default: 3000,
    },
    DATABASE_URL: {
      type: 'string',
    },
    SKINPORT_API_ORIGIN_URL: {
      type: 'string',
    },
    CACHE_URL: {
      type: 'string',
    },
    SESSION_SECRET: {
      type: 'string',
    },
    SESSION_SULT: {
      type: 'string'
    },
    ITEMS_CACHE_DURATION: {
      type: 'number'
    },
    NODE_ENV: {
      type: 'string'
    }
  },
};

const options = {
  confKey: 'config',
  schema: schema,
  dotentv: true
};

const setup: setupPlugin = async (app) => app.register(fastifyEnv, options);

export default setup;
