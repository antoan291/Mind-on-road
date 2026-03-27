import { createAppDefinition } from './app';

async function bootstrap() {
  const application = createAppDefinition();
  const port = Number(process.env.PORT ?? 3001);

  console.info(
    `[backend] ${application.appName} bootstrap placeholder on port ${port} with ${application.modules.length} modules`
  );
}

void bootstrap();
