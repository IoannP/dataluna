#!/usr/bin/env node

import setupApp from "../src/index";

const start = async () => {
  const app = await setupApp();
  const port = app.config.PORT || 3000;

  app.listen({ port }, () => app.log.info(`server started on port ${port}`));
};

start();
