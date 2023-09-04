import type { IHeaders } from 'kafkajs';
import {
  MessageData,
  MessageMetadata,
  MessageSchema,
  Schema,
  SchemaObject,
} from '@ts-messaging/common';
import { KafkaTopic } from './topic';
import { AbstractMessage } from '@ts-messaging/client';

export interface KafkaMessageData<
  Key extends SchemaObject | Buffer | null = any,
  Value extends SchemaObject | Buffer | null = any
> extends MessageData {
  key?: Key;
  value: Value;
}

export type KafkaHeaders = IHeaders;

export interface KafkaMessageSchema<
  Key extends SchemaObject = any,
  Value extends SchemaObject = any
> extends MessageSchema {
  key?: Schema<Key> | null;
  value: Schema<Value> | null;
}

export interface KafkaMetadata extends MessageMetadata {
  timestamp?: string;
  attributes?: number;
  offset?: string;
  headers?: KafkaHeaders;
  size?: number;
  partition?: number;
}

export class KafkaMessage<
  Key extends SchemaObject = any,
  Value extends SchemaObject = any
> extends AbstractMessage {
  readonly topic: KafkaTopic;
  readonly data: KafkaMessageData<Key, Value>;
  readonly meta: KafkaMetadata;
  readonly schema: KafkaMessageSchema<Key, Value> | null = null;

  constructor(args: {
    topic: KafkaTopic;
    data: KafkaMessageData<Key, Value>;
    meta?: KafkaMetadata;
    schema?: KafkaMessageSchema<Key, Value>;
  }) {
    super();
    this.topic = args.topic;
    this.data = args.data;
    this.meta = args.meta ?? {};
    this.schema = args.schema ?? null;
  }
}
