import { Logger } from '@nestjs/common';
import { Kafka } from '@ts-messaging/client-kafka';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { InventoryService } from './inventory.service';
import { InventorySagaMessage } from './schemas/InventorySagaMessage';
import { SagaReply } from 'lib/saga';

@Kafka.Controller()
export class InventoryMessagingController {
  @Kafka.InjectClient()
  readonly client: Kafka;

  protected readonly inventoryService = new InventoryService();

  @Kafka.Endpoint('inventory.saga')
  async onSaga(
    @Kafka.Key() key: SagaKey,
    @Kafka.Value() value: InventorySagaMessage
  ) {
    Logger.log({ key, value }, 'onSaga');

    try {
      if (key.status === 'COMPENSATING') {
        this.inventoryService.deleteReservations(value.sessionId);
      } else if (key.status === 'CONTINUE') {
        this.inventoryService.commitReservations(value.sessionId);
      }

      await this.client.produce({
        topic: 'inventory.saga.reply',
        data: {
          key: key,
          value: new SagaReply({ success: true }),
        },
      });
    } catch (e) {
      await this.client.produce({
        topic: 'inventory.saga.reply',
        data: {
          key: key,
          value: new SagaReply({ success: false }),
        },
      });
    }
  }
}
