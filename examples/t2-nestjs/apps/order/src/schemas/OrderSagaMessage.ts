import { Avro } from '@ts-messaging/schema-avro';

@Avro.Record({
  name: 'OrderSagaMessage',
})
export class OrderSagaMessage {
  @Avro.String()
  orderId: string;
}
