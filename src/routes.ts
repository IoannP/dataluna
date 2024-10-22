import { greetServer, getItems, purchaseItem } from './controllers';
import type { handle } from './types';

const routes = [
  { path: '/', method: 'GET', handle: greetServer },
  { path: '/items', method: 'GET', handle: getItems },
  { path: '/purchase', method: 'POST', handle: purchaseItem },
];

export default (path: string, method: string): { path: string; method: string; handle: handle } | undefined =>
  routes.find((route) => route.path === path && route.method === method.toUpperCase());
