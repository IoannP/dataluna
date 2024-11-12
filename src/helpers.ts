export const isUndefined = (value: unknown): boolean => typeof value === 'undefined';

export const isNull = (value: unknown): boolean => value === null;

export const toString = (value: unknown): string => JSON.stringify(value);

export const isInvalidBalanceError = (message: string) => message.includes('check_balance');

export const isString = (value: unknown): boolean => typeof value === 'string';
