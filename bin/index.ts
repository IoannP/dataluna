#!/usr/bin/env node

import setupApp from '../src/index';

const start = async () => {
  const { PORT = 3000 } = process.env;
  const app = await setupApp();
  app.listen(PORT, () => console.log(`server started on port ${PORT}`));
};

start();