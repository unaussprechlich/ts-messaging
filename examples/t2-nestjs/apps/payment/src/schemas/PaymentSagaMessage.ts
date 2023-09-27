import { Avro } from '@ts-messaging/schema-avro';

@Avro.Record({
  name: 'PaymentSagaMessage',
})
export class PaymentSagaMessage {
  @Avro.String()
  cardNumber: string;

  @Avro.String()
  cardOwner: string;

  @Avro.String()
  checksum: string;

  @Avro.Double()
  total: number;
}
