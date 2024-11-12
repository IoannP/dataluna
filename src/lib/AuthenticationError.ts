import { FastifyError } from 'fastify';

export default class AuthenticationError implements FastifyError {
  code: string;

  name: string;

  statusCode: number;

  message: string;

  constructor(message: string) {
    this.name = 'AuthenticationError';
    this.code = 'AUTHENTICATION_ERROR';
    this.statusCode = 401;
    this.message = message;
  }
}