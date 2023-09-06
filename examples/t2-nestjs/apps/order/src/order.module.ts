import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OrderService } from './order.service';
import { Kafka } from '@ts-messaging/client-kafka';
import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro } from '@ts-messaging/schema-avro';
import { OrderMessagingController } from './order.messaging.controller';

@Module({
  providers: [OrderService],
})
export class OrderModule implements OnModuleInit, OnModuleDestroy {
  protected readonly client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'order' },
    autoRegisterTopics: true,
    registry: new Confluent({
      autoRegisterSchemas: true,
      clientConfig: {
        baseUrl: 'http://localhost:8081',
      },
      schemaProviders: [new Avro()],
    }),
    controllers: [OrderMessagingController],
  });

  async onModuleInit() {
    await this.client.init();
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
