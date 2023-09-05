import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OrderService } from './order.service';
import { MessagingController } from '../../inventory/src/messaging.controller';
import { Kafka } from '@ts-messaging/client-kafka';
import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro } from '@ts-messaging/schema-avro';

@Module({
  providers: [OrderService],
})
export class OrderModule implements OnModuleInit, OnModuleDestroy {
  protected readonly client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'test' },
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