import { createClient, RedisClientType, type SetOptions } from 'redis';

export default class Cache {
  static connection: RedisClientType = null;

  static isConnected() {
    return this.connection !== null;
  }

  static init({ url }) {
    this.connection = createClient({ url });
  }

  static async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected()) {
      console.warn('Cache not connected. Setup cache.');
      return null;
    }
    await this.connection.connect();
    const value = await this.connection.get(key);
    await this.connection.disconnect();

    return JSON.parse(value);
  }

  static async set<T>(key: string, value: T, options: SetOptions = {}): Promise<undefined> {
    if (!this.isConnected()) {
      console.warn('Cache not connected. Setup cache.');
      return;
    }
    await this.connection.connect();
    await this.connection.set(key, JSON.stringify(value), options);
    await this.connection.disconnect();
  }
}
