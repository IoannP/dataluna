import nock from 'nock';
import { vi, beforeEach, afterEach, test, describe, expect } from 'vitest';

import { toString } from '../src/helpers'
import setupApp from '../src/index';
import fixtures from '../__fixtures__';

vi.mock('postgres', () => {
  return {
    default: vi.fn(() => ({
      begin: vi.fn()
    })),
  };
});

let app;
beforeEach(async () => {
  app = await setupApp();
});

afterEach(async () => {
  vi.clearAllMocks();
  nock.cleanAll();
});

describe('Test api', () => {
  describe('Positive case', async () => {
    const { items } = fixtures.positiveCase;
    const { user } = fixtures;

    test('Authentication', async () => {
      app.db = vi.fn(() => ([user]));

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username, password: user.password } })
        .then((res) => {
          expect(res.headers['set-cookie']).toMatch('session');
          expect(res.statusCode).toBe(200);
        })
    });

    test('Get items from API', async () => {
      const expirationTimeInSeconds = app.config.ITEMS_CACHE_DURATION || 60 * 5; // 5 minutes

      nock(process.env.SKINPORT_API_ORIGIN_URL || '')
        .get('/v1/items?app_id=730&currency=EUR&tradable=1')
        .reply(200, items);

      vi.spyOn(app.redis, 'setex').mockImplementation(async () => {});
      vi.spyOn(app.redis, 'get').mockImplementation(async () => null);

      await app
        .inject({ method: 'get', url: '/items'})
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res.body)).toEqual(items);
          expect(app.redis.setex).toHaveBeenLastCalledWith('items', expirationTimeInSeconds, toString(items));
          expect(app.redis.get).toBeCalledTimes(1);
        });
    });

    test('Get items from Cache', async () => {
      vi.spyOn(app.redis, 'setex').mockImplementation(async () => {});
      vi.spyOn(app.redis, 'get').mockImplementation(() => toString(items));

      await app
        .inject({ method: 'get', url: '/items' })
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res.body)).toStrictEqual(items);
          expect(app.redis.setex).not.toHaveBeenCalledOnce();
          expect(app.redis.get).toHaveLastReturnedWith(toString(items));
        });
    });

    test('Update password', async () => {
      app.db = () => ([user]);
      let cookie;

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username, password: user.password } })
        .then((res) => {
          cookie = res.headers['set-cookie'];
          expect(cookie).toMatch('session');
          expect(res.statusCode).toBe(200);
        });

      await app 
        .inject({ method: 'patch', url: '/password', payload: { userId: user.id, password: 'newPassword' }, headers: { cookie }})
        .then(async (res) => expect(res.statusCode).toBe(200));
    });

    test('Purchase item', async () => {
      app.db = () => ([user]);
      let cookie;

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username, password: user.password } })
        .then((res) => {
          cookie = res.headers['set-cookie'];
          expect(cookie).toMatch('session');
          expect(res.statusCode).toBe(200);
        });

      app.db = { begin: async () => ({ balance: 10 })};
      vi.spyOn(app.redis, 'get').mockImplementation(() => toString(user));

      await app 
        .inject({ method: 'post', url: '/purchase', payload: { userId: user.id, itemId: 1 }, headers: { cookie }})
        .then(async (res) => {
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res.body)).toEqual({ balance: 10 })
        });
      });
  });

  describe('Negative case', async () => {
    const { user } = fixtures;

    test('Not found', async () => {
      await app
        .inject({ method: 'get', url: '/someurl' })
        .then((res) => expect(res.statusCode).toBe(404));
    });

    test('Authenticate', async () => {
      app.db = vi.fn(() => ([]));

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username, password: user.password } })
        .then((res) => {
          expect(res.statusCode).toBe(401);
          expect(JSON.parse(res.body).error.reason).toBe('User not found');
        });

      await app
        .inject({ method: 'post', url: '/auth', payload: { password: user.password } })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res.body).error.reason).toBe('body must have required property \'username\'');
        })

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username } })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res.body).error.reason).toBe('body must have required property \'password\'');
        })
    });

    test('Purchase item', async () => {
      vi.spyOn(app.redis, 'get').mockImplementation(() => toString(user));

      app.db = () => ([user]);
      let cookie;

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username, password: user.password } })
        .then((res) => {
          cookie = res.headers['set-cookie'];
          expect(cookie).toMatch('session');
          expect(res.statusCode).toBe(200);
        });

      app.db = { begin: async () => {
        throw new Error('new row for relation "users" violates check constraint "check_balance"');
      }};
  
      await app 
        .inject({ method: 'post', url: '/purchase', payload: { userId: user.id, itemId: 1 }, headers: { cookie }})
        .then(async (res) => {
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res.body).error.reason).toBe('Invalid balance');
        });
    });

    test('Update password', async () => {
      app.db = () => ([user]);
      vi.spyOn(app.redis, 'del').mockImplementation(async () => {});

      let cookie;

      await app
        .inject({ method: 'post', url: '/auth', payload: { username: user.username, password: user.password } })
        .then((res) => {
          cookie = res.headers['set-cookie'];
          expect(cookie).toMatch('session');
          expect(res.statusCode).toBe(200);
        });

      await app 
        .inject({ method: 'patch', url: '/password', payload: {  password: 'newPassword' }, headers: { cookie }})
        .then(async (res) => {
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res.body).error.reason).toBe('body must have required property \'userId\'');
        });

      await app 
        .inject({ method: 'patch', url: '/password', payload: {  userId: user.id }, headers: { cookie }})
        .then(async (res) => {
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res.body).error.reason).toBe('body must have required property \'password\'');
        });

      await app 
        .inject({ method: 'patch', url: '/password', payload: {  userId: user.id, password: user.password }, headers: { cookie }})
        .then(async (res) => {
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res.body).error.reason).toBe('Password must be different from the old!');
        });
    });
  });
});
