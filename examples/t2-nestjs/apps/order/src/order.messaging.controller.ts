import { Logger } from '@nestjs/common';
import { Kafka, KafkaProducer } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { OrderService } from './order.service';
import { OrderSagaMessage } from './schemas/OrderSagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller({
  consumer: { groupId: 'order' },
})
export class OrderMessagingController {
  @Kafka.InjectClient()
  readonly client: Kafka;

  @Kafka.Producer()
  readonly producer: KafkaProducer;

  protected readonly orderService = new OrderService();

  @Kafka.Endpoint('order.saga')
  async onSaga(
    @Kafka.Key() key: SagaKey,
    @Kafka.Payload() payload: OrderSagaMessage
  ) {
    Logger.log({ key, payload }, 'order.saga');

    try {
      if (key.status === 'COMPENSATING') {
        this.orderService.rejectOrder(payload.orderId);
      } else if (key.status === 'CONTINUE') {
        this.orderService.createOrder(payload.orderId);
      }

      await this.producer.produce({
        channel: 'order.saga.reply',
        key: key,
        payload: new SagaReply({
          success: true,
        }),
      });
    } catch (e) {
      Logger.error(e);
      await this.producer.produce({
        channel: 'order.saga.reply',
        key: key,
        payload: new SagaReply({
          success: false,
        }),
      });
    }
  }
}
