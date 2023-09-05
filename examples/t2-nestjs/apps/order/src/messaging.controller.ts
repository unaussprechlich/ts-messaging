import { Logger } from '@nestjs/common';
import { Kafka } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { OrderService } from './order.service';
import { OrderSagaMessage } from './schemas/OrderSagaMessage';

@Kafka.Controller()
export class MessagingController {
  @Kafka.InjectClient()
  readonly client: Kafka;

  protected readonly orderService = new OrderService();

  @Kafka.Endpoint('order.saga')
  async onSaga(
    @Kafka.Key() key: SagaKey,
    @Kafka.Value() value: OrderSagaMessage
  ) {
    Logger.log(
      {
        key,
        value,
      },
      'order.saga'
    );

    if (key.status === 'COMPENSATING') {
      this.orderService.createOrder(value.orderId);
    } else if (key.status === 'CONTINUE') {
      this.orderService.rejectOrder(value.orderId);
    }

    await this.client.produce({
      topic: 'order.saga.reply',
      data: {
        key: SagaKey,
        value: { success: true },
      },
    });
  }
}
