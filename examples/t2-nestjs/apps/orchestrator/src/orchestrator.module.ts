import { Module } from '@nestjs/common';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';
import { KafkaProvider } from './kafka.provider';

@Module({
  controllers: [OrchestratorController],
  providers: [OrchestratorService, KafkaProvider],
})
export class OrchestratorModule {}
