import Database from './Database';
import Cache from './Cache';
import SkinportApi from './SkinportApi';
import { isNull } from './helpers';

import type { ServerResponse, IncomingMessage } from 'node:http';

export const greetServer = (_req: IncomingMessage, res: ServerResponse, err) => {
  try {
    res.writeHead(200);
    res.end('Hello!');
  } catch (error) {
    err(res, error);
  }  
};

export const getItems = async (_req: IncomingMessage, res: ServerResponse, err) => {
  try {
    let items = await Cache.get<object[]>('items');

    if (isNull(items)) {
      items = await SkinportApi.getItems();
      const expirationTimeInSeconds = 60 * 5; // 5 minutes
      await Cache.set<object[]>('items', items, { EX: expirationTimeInSeconds });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));
  } catch (error) {
    err(res, error);
  }
};

export const purchaseItem = async (req: IncomingMessage, res: ServerResponse, err) => {
  const bodyData: Uint8Array[] = [];
  req
    .on('error', (error) => {
      err(res, error);
    })
    .on('data', (chunk) => {
      bodyData.push(chunk);
    })
    .on('end', async () => {
      const body = Buffer.concat(bodyData).toString() || "{}";
      const { userId = null, itemId = null } = JSON.parse(body);

      if (isNull(userId)) {
        err(res, new Error('Required param: user id'));
        return;
      }

      if (isNull(itemId)) {
        err(res, new Error('Required param: item id'));
        return;
      }

      const transaction = await Database.initTransaction();
      await transaction.query('BEGIN;');

      try {
        const updateBalanceQuery = 'UPDATE dataluna.users SET balance = balance - (SELECT price FROM dataluna.items WHERE id = $1) WHERE id = $2;';
        const insertPurchaseQuery = 'INSERT INTO dataluna.purchases(item_id, user_id) VALUES($1, $2);';

        await transaction.query(updateBalanceQuery, [itemId, userId]);
        await transaction.query(insertPurchaseQuery, [itemId, userId]);

        await transaction.query('COMMIT;');
        await transaction.end();

        res.writeHead(200);
        res.end('Purchased item successfully');
      } catch (error) {
        await transaction.query('ROLLBACK;');
        await transaction.end();
        err(res, error);
      }
    });
};
