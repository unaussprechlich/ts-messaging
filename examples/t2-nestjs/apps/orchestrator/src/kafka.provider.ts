import { Kafka } from '@ts-messaging/client-kafka';
import { MessagingController } from '../../inventory/src/messaging.controller';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro } from '@ts-messaging/schema-avro';

@Injectable()
export class KafkaProvider implements OnModuleInit, OnModuleDestroy {
  readonly client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'orchestrator' },
    registry: new Confluent({
      clientConfig: {
        baseUrl: 'http://localhost:8081',
      },
      schemaProviders: [new Avro()],
    }),
    controllers: [MessagingController],
  });

  async onModuleInit() {
    await this.client.init();
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
