import { SchemaObject } from './SchemaObject';
import { RawSchema } from './RawSchema';

export interface Schema<T extends SchemaObject = SchemaObject> {
  readonly __id: number;
  readonly __type: string;
  readonly rawSchema: RawSchema;

  decode(buffer: Buffer): T;
  encode(data: T): Buffer;
  validate(data: T): { success: boolean };
}
