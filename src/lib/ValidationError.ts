import { FastifyError } from 'fastify';

export default class ValidationError implements FastifyError {
  code: string;

  name: string;

  statusCode: number;

  message: string;

  constructor(message: string) {
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.message = message;
  }
}