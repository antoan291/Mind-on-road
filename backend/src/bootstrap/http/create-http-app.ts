import express = require('express');

import type { BackendAppDefinition } from '../../app';

export function createHttpApp(appDefinition: BackendAppDefinition) {
  const app = express();

  app.get('/health', (_request, response) => {
    response.json({
      status: 'ok'
    });
  });

  return app;
}
