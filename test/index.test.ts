import nock from 'fetch-mock';
import supertest from 'supertest';
import { vi, beforeEach, afterEach, test, describe, expect } from 'vitest';

import Cache from '../src/Cache';
import setupApp from '../src/index';
import Database from '../src/Database';
import itemsFixtures from '../__fixtures__/items';

vi.mock(import('../src/Cache'));

const buildApiUrl = () => `${process.env.SKINPORT_API_ORIGIN_URL}/v1/items?app_id=730&currency=EUR&tradable=1`;

let app;
beforeEach(async () => {
  app = await setupApp();
});

afterEach(async () => {
  vi.clearAllMocks();
  nock.reset();
  await Database.query('DROP SCHEMA IF EXISTS dataluna CASCADE;');
});

describe('Test api', () => {
  describe('Positive case', async () => {
    const { items } = itemsFixtures.positiveCase;
    
    test('Get items from API', async () => {
      nock.mock(buildApiUrl(), { status: 200, body: items });

      vi.spyOn(Cache, 'set').mockImplementation(async () => {});
      vi.spyOn(Cache, 'get').mockImplementation(async () => null);

      await supertest(app)
        .get('/items')
        .expect(200)
        .then((res) => {
          expect(res.body).toStrictEqual(items);
          expect(Cache.set).toBeCalledWith('items', items, { EX: 60 * 5 });
          expect(Cache.get).toBeCalledTimes(1);
        });
    });

    test('Get items from Cache', async () => {
      vi.spyOn(Cache, 'set').mockImplementation(async () => {});
      vi.spyOn(Cache, 'get').mockImplementation(async () => items);

      await supertest(app)
        .get('/items')
        .expect(200)
        .then((res) => {
          expect(res.body).toStrictEqual(items);
          expect(Cache.set).toBeCalledTimes(0);
          expect(Cache.get).toBeCalledTimes(1);
        });
    });

    test('Purchase item', async () => {
      await supertest(app)
        .post('/purchase')
        .send({ userId: 1, itemId: 2 })
        .expect(200)
        .then(async (res) => {
          const purchase = await Database.query('SELECT * FROM dataluna.purchases WHERE user_id = $1 AND item_id = $2;', [1, 2]);
          expect(res.text).toBe('Purchased item successfully');
          expect(purchase.rows).toMatchObject([ { id: 1, user_id: 1, item_id: 2 } ]);
        });

      await supertest(app)
        .post('/purchase')
        .send({ userId: 1, itemId: 1 })
        .expect(400)
        .then(async (res) => {
          const purchase = await Database.query('SELECT * FROM dataluna.purchases WHERE user_id = $1 AND item_id = $2;', [1, 1]);
          expect(res.text).toBe('Invalid user balance');
          expect(purchase.rows).toMatchObject([]);
        });
    });
  });

  describe('Negative case', async () => {
    test('Rate limit', async () => {
      nock.mock(buildApiUrl(), 429);

      vi.spyOn(Cache, 'set').mockImplementation(async () => {});
      vi.spyOn(Cache, 'get').mockImplementation(async () => null);

      await supertest(app)
        .get('/items')
        .expect(429)
        .then((res) => {
          expect(res.text).toBe('Too Many Requests');
        });
    });

    test('Not found', async () => {
      await supertest(app)
        .get('/someRoute')
        .expect(404)
        .then((res) => {
          expect(res.text).toBe('Not Found');
        });
    });

    test('Required param user id', async () => {
      await supertest(app)
        .post('/purchase')
        .expect(400)
        .then((res) => {
          expect(res.text).toBe('Required param: user id');
        });
    });

    test('Required param item id', async () => {
      await supertest(app)
        .post('/purchase')
        .send({ userId: 1 })
        .expect(400)
        .then((res) => {
          expect(res.text).toBe('Required param: item id');
        });
    });
  });
});
