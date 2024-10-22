import http from 'node:http';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';

import Database from './Database';
import SkinportApi from './SkinportApi';
import Cache from './Cache';
import findRoute from './routes';
import { isUndefined, handleError } from './helpers';

export default async (): Promise<http.Server> => {
  dotenv.config();

  const {
    DATABASE_URL,
    DATABASE_URL_TEST,
    SKINPORT_API_ORIGIN_URL,
    NODE_ENV,
    CACHE_URL,
  } = process.env;
  const isTesting = NODE_ENV === 'test';

  Database.init({ url: isTesting ? DATABASE_URL_TEST : DATABASE_URL });
  SkinportApi.init({ url: SKINPORT_API_ORIGIN_URL });
  Cache.init({ url: CACHE_URL });

  const databaseSchema = await fs.readFile('./src/databaseSchema.sql', {
    encoding: 'utf-8',
  });
  await Database.query(databaseSchema);

  const server = http.createServer((req, res) => {
    const { url, method } = req;
    const route = findRoute(url, method);

    if (isUndefined(route)) {
      handleError(res, new Error('not found'));
      return;
    }
    route.handle(req, res, handleError);
  });

  return server;
};
