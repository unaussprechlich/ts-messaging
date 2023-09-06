import { Kafka } from '@ts-messaging/client-kafka';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro } from '@ts-messaging/schema-avro';
import { OrchestratorMessagingController } from './orchestrator.messaging.controller';

@Injectable()
export class KafkaProvider implements OnModuleInit, OnModuleDestroy {
  readonly client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'orchestrator' },
    autoRegisterTopics: true,
    registry: new Confluent({
      autoRegisterSchemas: true,
      clientConfig: {
        baseUrl: 'http://localhost:8081',
      },
      schemaProviders: [new Avro()],
    }),
    controllers: [OrchestratorMessagingController],
  });

  async onModuleInit() {
    await this.client.init();
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
