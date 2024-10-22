import type { ServerResponse, IncomingMessage } from 'node:http';


export type handleError = (response: ServerResponse, error: Error) => void;

export type handle = (request: IncomingMessage, response: ServerResponse, handleError: handleError) => Promise<void>|void;