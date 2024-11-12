import AuthenticationError from './lib/AuthenticationError';
import ValidationError from './lib/ValidationError';
import DatabaseError from './lib/DatabaseError';
import { isNull, isUndefined, toString, isInvalidBalanceError, isString } from './helpers';

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { handle } from './types';

export const getItems: handle = (app) => async (_req, reply) => {
  let items = await app.redis.get('items');

  if (isNull(items)) {
    const { data } = await app.skinportApi.get('/v1/items?app_id=730&currency=EUR&tradable=1');
    items = data;

    const expirationTimeInSeconds = app.config.ITEMS_CACHE_DURATION || 60 * 5; // 5 minutes
    await app.redis.setex('items', expirationTimeInSeconds, toString(items));
  }

  const responseData = isString(items) ? JSON.parse(items || '{}') : items;
  reply.send(responseData);
};

export const purchaseItem: handle = (app) => async (req, reply) => {
  const { userId, itemId } = req.body as { userId: number; itemId: number; };

  const user = await app.db
    .begin(async (sql) => {
      const [user] = await sql`
        UPDATE dataluna.users 
        SET balance = balance - (SELECT price FROM dataluna.items WHERE id = ${itemId})
        WHERE id = ${userId}
        RETURNING *;
      `;
      await sql`INSERT INTO dataluna.purchases(item_id, user_id) VALUES(${itemId}, ${userId});`;

      return user;
    })
    .catch((error) => {
      if (isInvalidBalanceError(error.message)) {
        throw new DatabaseError('Invalid balance');
      }
      throw error;
    });

  reply.send({ balance: user.balance });
};

export const authenticate: handle = (app) => async (req, reply) => {
  const { username, password } = req.body as { username: string; password: string; };

  const [user] = await app.db`
    SELECT
      id,
      username,
      password
    FROM dataluna.users
    WHERE username = ${username} AND password = ${password};
  `;

  if (isUndefined(user)) {
    throw new AuthenticationError('User not found')
  }

  req.session.set('user', { id: user.id, password: user.password });
  
  reply.send();
};

export const updatePassword: handle = (app) => async (req, reply) => {
  const { userId, password } = req.body as { userId: number; password: string; };

  req.log.debug('Update password request body: ', req.body);

  const [user] = await app.db`SELECT id, username, password FROM dataluna.users WHERE id = ${userId}`;
  const isSamePassword = user.password === password;

  if (isSamePassword) {
    throw new ValidationError('Password must be different from the old!');
  }

  await app.db`UPDATE dataluna.users SET password = ${password}`;
  await app.redis.del(`users:${user.id}`);

  req.session.delete();
  reply.send();
};

export const handleError = (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
  const isFastifyError = 'code' in error;

  request.log.debug('Handled error: ', error.message);

  if (isFastifyError) {
    reply.status(error.statusCode || 500).send({ error: { type: error.code, reason: error.message }});
    return;
  }

  reply.status(500).send({ error: { reason : error.message } });
};
