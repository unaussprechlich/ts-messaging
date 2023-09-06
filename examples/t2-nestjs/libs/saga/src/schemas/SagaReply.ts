import { Avro } from '@ts-messaging/schema-avro';

@Avro.Record({
  name: 'SagaReply',
})
export class SagaReply {
  @Avro.Boolean()
  success: boolean;

  constructor(args?: { success?: boolean }) {
    this.success = args?.success ?? false;
  }
}
