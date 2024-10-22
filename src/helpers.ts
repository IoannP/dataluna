import { ServerResponse, STATUS_CODES } from 'node:http';

enum statuses {
  rateLimit = 429,
  badRequest = 400,
  notFound = 404,
  serverError = 500,
}

export const isUndefined = (value): boolean => typeof value === 'undefined';
export const isNull = (value): boolean => value === null;

export const handleError = (res: ServerResponse, error: Error) => {
  const isRateLimitError = error.message === STATUS_CODES[statuses.rateLimit];
  if (isRateLimitError) {
    res.writeHead(statuses.rateLimit);
    res.end(STATUS_CODES[statuses.rateLimit]);
    return;
  }

  const isInvalidBalance = error.message.includes('check_balance');
  if (isInvalidBalance) {
    res.writeHead(statuses.badRequest);
    res.end('Invalid user balance');
    return;
  }

  const isNotFound = error.message.includes('not found');
  if (isNotFound) {
    res.writeHead(statuses.notFound);
    res.end(STATUS_CODES[statuses.notFound]);
    return;
  }

  res.writeHead(statuses.serverError);
  res.end(STATUS_CODES[statuses.serverError]);
};
