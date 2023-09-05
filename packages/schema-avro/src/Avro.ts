import { AvroSchemaFactory } from './AvroSchemaFactory';
import {
  BooleanSchemaDecoratorFactory,
  DoubleSchemaDecoratorFactory,
  FloatSchemaDecoratorFactory,
  IntSchemaDecoratorFactory,
  LongSchemaDecoratorFactory,
  NullSchemaDecoratorFactory,
  RecordSchemaDecoratorFactory,
  StringSchemaDecoratorFactory,
} from './decorators';
import { SchemaEntrypoint } from '@ts-messaging/common';

export class Avro implements SchemaEntrypoint {
  static readonly TYPENAME = 'AVRO';
  static readonly INJECT_TOKEN: symbol = Symbol('@ts-messaging/schema-avro');

  readonly TYPENAME = Avro.TYPENAME;
  readonly INJECT_TOKEN = Avro.INJECT_TOKEN;
  readonly SchemaFactoryConstructor = AvroSchemaFactory;

  static readonly Record = RecordSchemaDecoratorFactory;
  static readonly Boolean = BooleanSchemaDecoratorFactory;
  static readonly Double = DoubleSchemaDecoratorFactory;
  static readonly Int = IntSchemaDecoratorFactory;
  static readonly String = StringSchemaDecoratorFactory;
  static readonly Long = LongSchemaDecoratorFactory;
  static readonly Null = NullSchemaDecoratorFactory;
  static readonly Float = FloatSchemaDecoratorFactory;
}
