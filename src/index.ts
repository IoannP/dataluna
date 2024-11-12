import fastify, { type FastifyInstance } from 'fastify';
import dotenv from 'dotenv';

import setupRoutes from './routes';
import setupPlugins from './plugins';
import setupDatabase from './database';

import type { Sql } from 'postgres';
import type { Axios } from 'axios';
import type { User } from './types';

declare module '@fastify/secure-session' {
  interface SessionData {
    user: User
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Sql;
    skinportApi: Axios;
    config: {
      PORT: number;
      DATABASE_URL: string;
      SKINPORT_API_ORIGIN_URL: string;
      SESSION_SECRET: string;
      SESSION_SULT: string;
      DATABASE_URL_TEST?: string;
      CACHE_URL?: string;
      ITEMS_CACHE_DURATION?: number;
      NODE_ENV?: string;
    }
  }
}

export default async (): Promise<FastifyInstance> => {
  dotenv.config();

  const isDevelopment = process.env.NODE_ENV === 'development';
  const app = await fastify({ logger: { level: isDevelopment ? 'debug' : 'info' } });

  await setupPlugins(app);
  await setupDatabase(app);
  setupRoutes(app);

  return app;
};
