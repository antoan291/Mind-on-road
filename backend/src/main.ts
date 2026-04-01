import type { Server } from 'node:http';

import { createAppDefinition } from './app';
import { createHttpApp } from './bootstrap/http/create-http-app';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const appDefinition = createAppDefinition();
  const httpApp = createHttpApp(appDefinition);
  let httpServer: Server | undefined;
  let isShuttingDown = false;

  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.info(`[backend] received ${signal}, shutting down`);

    if (!httpServer) {
      process.exit(0);
    }

    httpServer.close((error) => {
      if (error) {
        console.error('[backend] failed to close HTTP server cleanly', error);
        process.exit(1);
      }

      console.info('[backend] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  httpServer = httpApp.listen(appConfig.port, () => {
    console.info(
      `[backend] ${appDefinition.appName} listening on port ${appConfig.port} with ${appDefinition.modules.length} modules`
    );
  });
}

void bootstrap().catch((error) => {
  console.error('[backend] startup failed', error);
  process.exit(1);
});
