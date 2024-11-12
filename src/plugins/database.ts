import postgres from 'postgres';
import type { setupPlugin } from '../types';

const setup: setupPlugin = (app) => {
  const { DATABASE_URL_TEST, DATABASE_URL, NODE_ENV } = app.config;
  const isTesting = NODE_ENV === 'test';
  const databaseUrl = isTesting ? DATABASE_URL_TEST : DATABASE_URL;
  const database = postgres(databaseUrl || '');
  app.decorate('db', database);
};

export default setup;
