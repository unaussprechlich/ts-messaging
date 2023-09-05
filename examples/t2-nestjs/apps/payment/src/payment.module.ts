import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro } from '@ts-messaging/schema-avro';
import { Kafka } from '@ts-messaging/client-kafka';
import { PaymentMessagingController } from './payment.messaging.controller';

@Module({
  providers: [PaymentService],
})
export class PaymentModule implements OnModuleInit, OnModuleDestroy {
  protected readonly client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'payment' },
    registry: new Confluent({
      autoRegisterSchemas: true,
      clientConfig: {
        baseUrl: 'http://localhost:8081',
      },
      schemaProviders: [new Avro()],
    }),
    controllers: [PaymentMessagingController],
  });

  async onModuleInit() {
    await this.client.init();
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
