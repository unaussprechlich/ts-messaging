import { Logger } from '@nestjs/common';
import { Kafka, KafkaProducer } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { OrchestratorService } from './orchestrator.service';
import { InventorySagaMessage } from './schemas/InventorySagaMessage';
import { PaymentSagaMessage } from './schemas/PaymentSagaMessage';
import { OrderSagaMessage } from './schemas/OrderSagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller({
  consumer: { groupId: 'orchestrator' },
})
export class OrchestratorMessagingController {
  @Kafka.InjectClient()
  readonly kafka: Kafka;

  @Kafka.Producer()
  readonly producer: KafkaProducer;

  protected readonly orchestratorService = new OrchestratorService();

  @Kafka.Endpoint('order.saga.reply')
  async onSagaOrderReply(
    @Kafka.Key()
    key: SagaKey,
    @Kafka.Payload()
    payload: SagaReply
  ) {
    Logger.log({ key, payload }, 'order.saga.reply');

    if (payload.success && key.status === 'CONTINUE') {
      key.index++;
      await this.sendToInventory(key);
      return;
    } else {
      await this.rejectSaga(key);
      return;
    }
  }

  @Kafka.Endpoint('inventory.saga.reply')
  async onSagaInventoryReply(
    @Kafka.Key()
    key: SagaKey,
    @Kafka.Payload()
    payload: SagaReply
  ) {
    Logger.log({ key, payload }, 'inventory.saga.reply');

    if (key.status === 'CONTINUE') {
      if (!payload.success) {
        key.status = 'COMPENSATING';
        key.index--;
        await this.sendToOrder(key);
        return;
      }

      key.index++;
      await this.sendToPayment(key);
      return;
    }

    if (key.status === 'COMPENSATING') {
      if (!payload.success) {
        await this.rejectSaga(key);
        return;
      }

      key.index--;
      await this.sendToPayment(key);
      return;
    }

    throw new Error('Invalid status');
  }

  @Kafka.Endpoint('payment.saga.reply')
  async onSagaPaymentReply(
    @Kafka.Key()
    key: SagaKey,
    @Kafka.Payload()
    payload: SagaReply
  ) {
    Logger.log({ key, payload }, 'payment.saga.reply');

    if (key.status === 'CONTINUE') {
      if (!payload.success) {
        key.status = 'COMPENSATING';
        key.index--;
        await this.sendToInventory(key);
        return;
      }

      key.status = 'COMPLETED';
      await this.producer.produce({
        channel: 'saga.completed',
        key,
        payload: this.orchestratorService.findSagaItem(key),
      });
      return;
    }
    throw new Error('Invalid status');
  }

  private async sendToPayment(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    await this.producer.produce({
      channel: 'payment.saga',
      key,
      payload: new PaymentSagaMessage({
        cardNumber: item.payload.cardNumber,
        cardOwner: item.payload.cardOwner,
        checksum: item.payload.checksum,
        total: item.payload.total,
      }),
    });
  }

  private async sendToInventory(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    await this.producer.produce({
      channel: 'inventory.saga',
      key,
      payload: new InventorySagaMessage({
        sessionId: item.sessionId,
      }),
    });
  }

  private async sendToOrder(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    await this.producer.produce({
      channel: 'order.saga',
      key,
      payload: new OrderSagaMessage({
        orderId: item.sessionId + '-' + key.id,
      }),
    });
  }

  private async rejectSaga(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    key.status = 'REJECTED';
    await this.producer.produce({
      channel: 'saga.rejected',
      key,
      payload: item,
    });

    this.orchestratorService.repository.delete(item);
  }
}
