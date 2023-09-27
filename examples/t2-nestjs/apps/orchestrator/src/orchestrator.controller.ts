import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { KafkaProvider } from './kafka.provider';
import { OrderSagaMessage } from './schemas/OrderSagaMessage';
import { z } from 'zod';
import { KafkaProducer } from '@ts-messaging/client-kafka';

export const CreateOrderBody = z.object({
  sessionId: z.string(),
  cardNumber: z.string(),
  cardOwner: z.string(),
  checksum: z.string(),
  total: z.number(),
});

@Controller()
export class OrchestratorController {
  readonly producer: KafkaProducer;

  constructor(
    readonly kafka: KafkaProvider,
    readonly service: OrchestratorService
  ) {
    this.producer = this.kafka.client.broker.createProducer({});
  }

  @Post()
  async createOrder(@Body() body: z.infer<typeof CreateOrderBody>) {
    Logger.log(JSON.stringify(body), 'OrchestratorController.createOrder');
    const key = this.service.createSagaItem(CreateOrderBody.parse(body));
    const result = await this.producer.produce({
      channel: 'order.saga',
      key,
      payload: new OrderSagaMessage({
        orderId: body.sessionId + '-' + key.id,
      }),
    });
    return {
      key: key,
      messages: result,
    };
  }
}
