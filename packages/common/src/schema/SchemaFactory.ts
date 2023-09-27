import { SchemaObject } from './SchemaObject';
import { RawSchema } from './RawSchema';
import { Schema } from './Schema';

export interface SchemaFactory<SchemaType extends string = string> {
  readonly __type: SchemaType;

  produce<T extends SchemaObject = SchemaObject>(config: {
    __id: number;
    rawSchema: RawSchema<SchemaType>;
  }): Schema<T>;
}
