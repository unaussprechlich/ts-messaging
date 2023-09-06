import { Logger } from '@nestjs/common';
import { Kafka } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { PaymentService } from './payment.service';
import { PaymentSagaMessage } from './schemas/PaymentSagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller()
export class PaymentMessagingController {
  @Kafka.InjectClient()
  readonly client: Kafka;

  protected readonly paymentService = new PaymentService();

  @Kafka.Endpoint('payment.saga')
  async onSaga(
    @Kafka.Key() key: SagaKey,
    @Kafka.Value() value: PaymentSagaMessage
  ) {
    Logger.log({ key, value }, 'payment.saga');

    try {
      await this.client.produce({
        topic: 'order.saga.reply',
        data: {
          key: key,
          value: new SagaReply({
            success: this.paymentService.processPayment({
              amount: value.total,
              cardNumber: value.cardNumber,
              cardOwner: value.cardOwner,
              checksum: value.checksum,
            }),
          }),
        },
      });
    } catch (e) {
      await this.client.produce({
        topic: 'order.saga.reply',
        data: {
          key: key,
          value: new SagaReply({
            success: false,
          }),
        },
      });
    }
  }
}
