import { Pool } from 'pg';
import { isNull } from './helpers';

export default class Database {
  static connection: Pool = null;

  static url: string = null;

  static init({ url }) {
    this.url = url;
    this.connection = new Pool({ connectionString: url });
  }

  static async query(query: string, params: string[]|number[] = []): Promise<{ rows: object[] }> {
    if (isNull(this.connection)) {
      console.warn('Database not connected. Setup database.');
      return;
    }

    const result = await this.connection.query(query, params);
    return result;
  }

  static async initTransaction(): Pool {
    if (isNull(this.url)) {
      console.warn('Database url required. Setup database.');
      return;
    }

    const transaction = await this.connection.connect();
    return transaction;
  }
}
