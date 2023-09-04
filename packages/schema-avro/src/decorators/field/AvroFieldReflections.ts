import { ReflectionHelper } from '@ts-messaging/common';
import { FieldConfig } from '../../types';

export const AvroFieldReflections = new ReflectionHelper<FieldConfig>(
  '@ts-messaging/schema-avro::Field'
);
