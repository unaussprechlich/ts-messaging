import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka } from '@ts-messaging/client-kafka';
import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro } from '@ts-messaging/schema-avro';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryMessagingController } from './inventory.messaging.controller';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule implements OnModuleInit, OnModuleDestroy {
  protected readonly client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'inventory' },
    registry: new Confluent({
      autoRegisterSchemas: true,
      clientConfig: {
        baseUrl: 'http://localhost:8081',
      },
      schemaProviders: [new Avro()],
    }),
    controllers: [InventoryMessagingController],
  });

  async onModuleInit() {
    await this.client.init();
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
