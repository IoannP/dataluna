import { FastifyError } from 'fastify';

export default class DatabaseError implements FastifyError {
  code: string;

  name: string;

  statusCode: number;

  message: string;

  constructor(message: string) {
    this.name = 'QueryError';
    this.code = 'DATABASE_ERROR';
    this.statusCode = 400;
    this.message = message;
  }
}