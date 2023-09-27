import { NestFactory } from '@nestjs/core';
import { OrchestratorModule } from './orchestrator.module';

async function bootstrap() {
  const app = await NestFactory.create(OrchestratorModule);
  await app.listen(3002);
}
bootstrap();
