import { AvroObject, AvroSchema } from './AvroSchema';
import { AvroRawSchema } from './AvroRawSchema';
import { SchemaFactory } from '@ts-messaging/common';
import { Avro } from './Avro';

export class AvroSchemaFactory implements SchemaFactory<typeof Avro.TYPENAME> {
  readonly __type = Avro.TYPENAME;

  produce<T extends AvroObject>(config: {
    __id: number;
    rawSchema: AvroRawSchema;
  }): AvroSchema<T> {
    return new AvroSchema<T>(config);
  }
}
