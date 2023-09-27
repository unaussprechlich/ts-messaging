import type { IHeaders, Message as MessageKafkaJs } from 'kafkajs';
import {
  MessageMetadata,
  SchemaObject,
  ContractVersion,
  MagicByteSerializer,
} from '@ts-messaging/common';
import { KafkaChannel } from './channel';
import { AbstractMessage } from '@ts-messaging/client';

export type KafkaHeaders = IHeaders;

export interface KafkaMessageMetadata extends MessageMetadata {
  timestamp?: string;
  attributes?: number;
  offset?: string;
  headers?: KafkaHeaders;
  size?: number;
  partition?: number;
}

export class KafkaMessage<
  Key extends SchemaObject = any,
  Payload extends SchemaObject = any
> extends AbstractMessage {
  readonly channel: KafkaChannel;
  readonly key?: Key;
  readonly keyContractVersion?: ContractVersion<Key>;
  readonly payload: Payload | null;
  readonly contractVersion: ContractVersion<Payload> | null;
  readonly meta: KafkaMessageMetadata;

  constructor(args: {
    channel: KafkaChannel;
    payload: Payload | null;
    contractVersion: ContractVersion<Payload> | null;
    key?: Key;
    keyContractVersion?: ContractVersion<Key>;
    meta?: KafkaMessageMetadata;
  }) {
    super();
    this.channel = args.channel;
    this.payload = args.payload;
    this.contractVersion = args.contractVersion;
    this.key = args.key;
    this.keyContractVersion = args.keyContractVersion;
    this.meta = args.meta ?? {};
  }

  toKafkaJsMessage(): MessageKafkaJs {
    return {
      key: this.encodeKey() ?? undefined,
      value: this.encodePayload(),
      headers: this.meta.headers,
      timestamp: this.meta.timestamp,
      partition: this.meta.partition,
    };
  }

  private encodeKey(): Buffer | undefined | string {
    if (!this.key) {
      return undefined;
    }

    if (this.keyContractVersion?.schema.__id) {
      return MagicByteSerializer.encode(
        this.keyContractVersion?.schema.encode(this.key),
        this.keyContractVersion?.schema.__id
      );
    }

    return JSON.stringify(this.key);
  }

  private encodePayload(): Buffer {
    if (this.contractVersion?.schema.__id && this.payload) {
      return MagicByteSerializer.encode(
        this.contractVersion.schema.encode(this.payload),
        this.contractVersion.schema.__id
      );
    }

    return Buffer.from(JSON.stringify(this.payload));
  }
}
