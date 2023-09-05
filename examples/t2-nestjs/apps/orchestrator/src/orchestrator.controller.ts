import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { KafkaProvider } from './kafka.provider';
import { OrderSagaMessage } from './schemas/OrderSagaMessage';

interface CreateOrderRequest {
  sessionId: string;
  cardNumber: string;
  cardOwner: string;
  checksum: string;
  total: number;
}

@Controller()
export class OrchestratorController {
  constructor(
    readonly kafka: KafkaProvider,
    readonly service: OrchestratorService
  ) {}

  @Post()
  async createOrder(@Body() body: CreateOrderRequest) {
    Logger.log(JSON.stringify(body), 'OrchestratorController.createOrder');
    const key = this.service.createSagaItem(body);
    const result = await this.kafka.client.produce({
      topic: 'order.saga',
      data: {
        key,
        value: new OrderSagaMessage({
          orderId: body.sessionId + '-' + key.id,
        }),
      },
    });
    return {
      key: key,
      messages: result,
    };
  }
}
