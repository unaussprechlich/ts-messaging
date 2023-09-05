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

  constructor(args: {
    cardNumber: string;
    cardOwner: string;
    checksum: string;
    total: number;
  }) {
    this.cardNumber = args.cardNumber;
    this.cardOwner = args.cardOwner;
    this.checksum = args.checksum;
    this.total = args.total;
  }
}
