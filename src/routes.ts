import { FastifyInstance } from 'fastify';
import {
  getItems,
  authenticate,
  purchaseItem,
  updatePassword,
  handleError
} from './controllers';
import { isNull, isUndefined, toString } from './helpers';
import AuthenticationError from './lib/AuthenticationError';
import schemas from './schemas';

import type { User } from './types';

const throwAuthError = () => {
  throw new AuthenticationError('Authentication required');
};

export default (app: FastifyInstance) => {
  app.setErrorHandler(handleError);
  app.get('/', async (_req, res) => res.send('Hello!'));
  app.post('/auth', { schema: schemas.authSchema }, authenticate(app));
  app.get('/items', getItems(app));

  app.post('/logout', async (req, res) => {
    req.session.delete();
    res.send();
  });

  app.register((app, _opts, done) => {
    app.addHook('preHandler', async (req) => {
      const sessionUser: User | undefined = req.session.get('user');

      if (isUndefined(sessionUser)) {
        throwAuthError();
      }

      const cachedUser: string | null = await app.redis.get(`users:${sessionUser?.id}`);
      let user: User | null = isNull(cachedUser) ? null: JSON.parse(cachedUser || '')

      if (isNull(cachedUser)) {
        const [databaseUser] = await app.db`SELECT id, password FROM dataluna.users WHERE id = ${toString(sessionUser?.id)}`;
        const oneDayInSeconds = 60 * 60 * 24;
        if (!isUndefined(databaseUser)) {
          await app.redis.setex(`users:${sessionUser?.id}`, oneDayInSeconds, toString(databaseUser));
          user = databaseUser as User;
        }
      }
      if (isNull(user)) {
        throwAuthError();
      }

      const isSamePassword = user?.password === sessionUser?.password; 
      if (!isSamePassword) {
        throwAuthError();
      }
    });

    app.post('/purchase', purchaseItem(app));
    app.patch('/password', { schema: schemas.passwordSchema }, updatePassword(app));

    done();
  });
};
