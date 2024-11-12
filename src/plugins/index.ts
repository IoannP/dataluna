import type { FastifyInstance } from 'fastify';
import type { setupPlugin } from '../types';

import setupEnv from './env';
import setupDatabase from './database';
import setupSession from './session';
import setupAxios from './axios';
import setupCach from './cach';

const plugins: setupPlugin[] = [
  setupCach,
  setupDatabase,
  setupAxios,
  setupSession,
];

export default async (app: FastifyInstance): Promise<void> => {
  await setupEnv(app);
  const setups = plugins.map((setupPlugin) => setupPlugin(app));
  await Promise.all(setups);
};
