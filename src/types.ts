import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export type setupPlugin = (app: FastifyInstance) => Promise<void> | void | Promise<FastifyInstance> | FastifyInstance;

export type handle = (app: FastifyInstance) => (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void;

export type User = {
  id: number;
  password: string;
  username?: string;
  balance?: number;
};

export type ErrorData = {
  message: string;
  reason: string;
}
