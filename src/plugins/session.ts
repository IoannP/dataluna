import fastifySecureSession from '@fastify/secure-session';

import type { setupPlugin } from '../types';

const setup: setupPlugin = (app) => {
  const { SESSION_SECRET, SESSION_SULT } = app.config;
  app.register(fastifySecureSession, { secret: SESSION_SECRET, salt: SESSION_SULT });
};

export default setup;