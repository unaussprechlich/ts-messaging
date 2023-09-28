import { Logger } from '@nestjs/common';
import { Kafka, KafkaProducer } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { InventoryService } from './inventory.service';
import { InventorySagaMessage } from './schemas/InventorySagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller({
  consumer: { groupId: 'inventory' },
})
export class InventoryMessagingController {
  @Kafka.InjectClient()
  readonly client: Kafka;

  @Kafka.Producer()
  readonly producer: KafkaProducer;

  protected readonly inventoryService = new InventoryService();

  @Kafka.Endpoint('inventory.saga')
  async onSaga(
    @Kafka.Key() key: SagaKey,
    @Kafka.Payload() payload: InventorySagaMessage
  ) {
    Logger.log({ key, payload }, 'onSaga');

    try {
      if (key.status === 'COMPENSATING') {
        this.inventoryService.deleteReservations(payload.sessionId);
      } else if (key.status === 'CONTINUE') {
        this.inventoryService.commitReservations(payload.sessionId);
      }

      await this.producer.produce({
        channel: 'inventory.saga.reply',
        key: key,
        payload: new SagaReply({ success: true }),
      });
    } catch (e) {
      Logger.error(e);
      await this.producer.produce({
        channel: 'inventory.saga.reply',
        key: key,
        payload: new SagaReply({ success: false }),
      });
    }
  }
}
