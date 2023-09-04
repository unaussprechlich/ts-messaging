import { Type } from 'avsc';
import { AvroRawSchema } from './AvroRawSchema';
import { ZodType } from 'zod';
import { AvroZodTypeFactory } from './AvroZodTypeFactory';
import { RawSchema, SchemaObject, Injectable } from '@ts-messaging/common';
import { AbstractSchema } from '@ts-messaging/schema';
import { Avro } from './Avro';

export interface AvroObject extends SchemaObject {}

@Injectable()
export class AvroSchema<
  T extends AvroObject = AvroObject
> extends AbstractSchema<T> {
  protected static zodTypeFactory = new AvroZodTypeFactory();

  protected schemaType: Type;
  protected zodType: ZodType<T>;

  readonly __type = Avro.TYPENAME;
  readonly __id: number;
  readonly rawSchema: AvroRawSchema;

  constructor(config: { __id: number; rawSchema: AvroRawSchema }) {
    super();
    this.__id = config.__id;
    this.rawSchema = config.rawSchema;
    this.schemaType = Type.forSchema(config.rawSchema.schema as any);
    this.zodType = this.genZodType(config.rawSchema);
  }

  encode(data: T): Buffer {
    return this.schemaType.toBuffer(data);
  }

  decode(buffer: Buffer): T {
    return this.schemaType.fromBuffer(buffer) as T;
  }

  validate(data: T) {
    return this.zodType.safeParse(data);
  }

  toString(): string {
    return JSON.stringify(this.rawSchema);
  }

  protected genZodType(rawSchema: RawSchema): ZodType<T> {
    return AvroSchema.zodTypeFactory.produce<T>(rawSchema as AvroRawSchema);
  }
}
