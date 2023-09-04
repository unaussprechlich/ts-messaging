import { RecordConfig } from './types';
import { RawSchema } from '@ts-messaging/common';
import { Avro } from './Avro';

export type AvroRawSchema = RawSchema<typeof Avro.TYPENAME, RecordConfig>;
