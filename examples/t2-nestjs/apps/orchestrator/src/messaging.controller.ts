import { Logger } from '@nestjs/common';
import { Kafka } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { OrchestratorService } from './orchestrator.service';
import { InventorySagaMessage } from './schemas/InventorySagaMessage';
import { PaymentSagaMessage } from '../../payment/src/schemas/PaymentSagaMessage';
import { OrderSagaMessage } from './schemas/OrderSagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller()
export class MessagingController {
  @Kafka.InjectClient()
  readonly kafka: Kafka;

  protected readonly orchestratorService = new OrchestratorService();

  @Kafka.Endpoint('order.saga.reply')
  async onSagaOrderReply(
    @Kafka.Key()
    key: SagaKey,
    @Kafka.Value()
    value: SagaReply
  ) {
    Logger.log({ key, value }, 'order.saga.reply');

    if (value.success && key.status === 'CONTINUE') {
      key.index++;
      return await this.sendToInventory(key);
    } else {
      return await this.rejectSaga(key);
    }
  }

  @Kafka.Endpoint('inventory.saga.reply')
  async onSagaInventoryReply(
    @Kafka.Key()
    key: SagaKey,
    @Kafka.Value()
    value: SagaReply
  ) {
    Logger.log({ key, value }, 'inventory.saga.reply');

    if (key.status === 'CONTINUE') {
      if (!value.success) {
        key.status = 'COMPENSATING';
        key.index--;
        return await this.sendToOrder(key);
      }

      key.index++;
      return await this.sendToPayment(key);
    }

    if (key.status === 'COMPENSATING') {
      if (!value.success) {
        return await this.rejectSaga(key);
      }

      key.index--;
      return await this.sendToPayment(key);
    }

    throw new Error('Invalid status');
  }

  @Kafka.Endpoint('payment.saga.reply')
  async onSagaPaymentReply(
    @Kafka.Key()
    key: SagaKey,
    @Kafka.Value()
    value: SagaReply
  ) {
    Logger.log({ key, value }, 'payment.saga.reply');

    if (key.status === 'CONTINUE') {
      if (!value.success) {
        key.status = 'COMPENSATING';
        key.index--;
        return await this.sendToInventory(key);
      }

      key.status = 'COMPLETED';
      return await this.kafka.produce({
        topic: 'saga.completed',
        data: {
          key,
          value: this.orchestratorService.findSagaItem(key),
        },
      });
    }

    throw new Error('Invalid status');
  }

  private async sendToPayment(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    await this.kafka.produce({
      topic: 'payment.saga',
      data: {
        key,
        value: new PaymentSagaMessage({
          cardNumber: item.payload.cardNumber,
          cardOwner: item.payload.cardOwner,
          checksum: item.payload.checksum,
          total: item.payload.total,
        }),
      },
    });
  }

  private async sendToInventory(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    await this.kafka.produce({
      topic: 'inventory.saga',
      data: {
        key,
        value: new InventorySagaMessage({
          sessionId: item.sessionId,
        }),
      },
    });
  }

  private async sendToOrder(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    await this.kafka.produce({
      topic: 'order.saga',
      data: {
        key,
        value: new OrderSagaMessage({
          orderId: item.sessionId + '-' + key.id,
        }),
      },
    });
  }

  private async rejectSaga(key: SagaKey) {
    const item = this.orchestratorService.findSagaItem(key);
    key.status = 'REJECTED';
    await this.kafka.produce({
      topic: 'saga.rejected',
      data: {
        key,
        value: item,
      },
    });

    this.orchestratorService.repository.delete(item);
  }
}
