import { ReflectionHelper } from '@ts-messaging/common';
import { FieldConfig, RecordConfig } from '../../types';

export const AvroRecordReflections = new ReflectionHelper<RecordConfig>(
  '@ts-messaging/schema-avro::Record'
);

export const AvroRecordFieldsReflections = new ReflectionHelper<FieldConfig[]>(
  '@ts-messaging/schema-avro::Record.fields',
  () => []
);
