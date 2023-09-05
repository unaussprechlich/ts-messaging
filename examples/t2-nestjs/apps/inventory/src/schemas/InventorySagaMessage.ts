import { Avro } from '@ts-messaging/schema-avro';

@Avro.Record({
  name: 'InventorySagaMessage',
})
export class InventorySagaMessage {
  @Avro.String()
  sessionId: string;
}
