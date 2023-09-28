import { Logger } from '@nestjs/common';
import { Kafka, KafkaProducer } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { PaymentService } from './payment.service';
import { PaymentSagaMessage } from './schemas/PaymentSagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller({ consumer: { groupId: 'payment' } })
export class PaymentMessagingController {
  @Kafka.InjectClient()
  readonly client: Kafka;

  @Kafka.Producer()
  readonly producer: KafkaProducer;

  protected readonly paymentService = new PaymentService();

  @Kafka.Endpoint('payment.saga')
  async onSaga(
    @Kafka.Key() key: SagaKey,
    @Kafka.Payload() payload: PaymentSagaMessage
  ) {
    Logger.log({ key, payload }, 'payment.saga');

    try {
      await this.producer.produce({
        channel: 'payment.saga.reply',
        key: key,
        payload: new SagaReply({
          success: this.paymentService.processPayment({
            amount: payload.total,
            cardNumber: payload.cardNumber,
            cardOwner: payload.cardOwner,
            checksum: payload.checksum,
          }),
        }),
      });
    } catch (e) {
      Logger.error(e);
      await this.producer.produce({
        channel: 'payment.saga.reply',
        key: key,
        payload: new SagaReply({
          success: false,
        }),
      });
    }
  }
}
