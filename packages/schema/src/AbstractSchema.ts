import { RawSchema, SchemaObject, Schema } from '@ts-messaging/common';

export abstract class AbstractSchema<T extends SchemaObject = SchemaObject>
  implements Schema
{
  abstract readonly __id: number;
  abstract readonly __type: string;

  abstract readonly rawSchema: RawSchema;

  abstract decode(buffer: Buffer): T;
  abstract encode(data: T): Buffer;
  abstract validate(data: T): { success: boolean };

  abstract toString(): string;
}
