import axios from 'axios';
import type { setupPlugin } from '../types';

const setup: setupPlugin = (app) => app.decorate(
  'skinportApi',
  axios.create({ baseURL: app.config.SKINPORT_API_ORIGIN_URL })
);

export default setup;
