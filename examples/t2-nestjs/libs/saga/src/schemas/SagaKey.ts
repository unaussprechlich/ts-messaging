import { Avro } from '@ts-messaging/schema-avro';

@Avro.Record({
  name: 'SagaKey',
})
export class SagaKey {
  @Avro.String()
  id: string = '';

  @Avro.Int()
  index: number = 0;

  @Avro.String()
  status: string | SagaStatus = 'CONTINUE';

  constructor(id: string) {
    this.id = id;
  }
}

type SagaStatus = 'CONTINUE' | 'COMPLETED' | 'COMPENSATING' | 'REJECTED';
