import redis from '@fastify/redis';
import type { setupPlugin } from '../types';

const setup: setupPlugin = (app) => app.register(redis, { url: app.config.CACHE_URL || '' });

export default setup;
