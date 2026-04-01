import { createAppDefinition } from './app';
import { createHttpApp } from './bootstrap/http/create-http-app';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const appDefinition = createAppDefinition();
  const httpApp = createHttpApp(appDefinition);

  httpApp.listen(appConfig.port, () => {
    console.info(
      `[backend] ${appDefinition.appName} listening on port ${appConfig.port} with ${appDefinition.modules.length} modules`
    );
  });
}

void bootstrap();
