import {
  DecodeResult,
  EncodeResult,
  Logger,
  LoggerChild,
  SchemaObject,
  Subject,
} from '@ts-messaging/common';
import { AbstractTopic } from '@ts-messaging/client';

export class KafkaTopic extends AbstractTopic {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaTopic',
    uuid: this.__uid,
  });
  readonly name: string;
  readonly keySubject: Subject;
  readonly valueSubject: Subject;

  constructor(config: {
    name: string;
    keySubject: Subject;
    valueSubject: Subject;
  }) {
    super();
    this.name = config.name;
    this.keySubject = config.keySubject;
    this.valueSubject = config.valueSubject;
  }

  async decodeMessageData<
    Key extends SchemaObject = SchemaObject,
    Value extends SchemaObject = SchemaObject
  >(message: {
    key?: Buffer | null;
    value: Buffer;
  }): Promise<{
    key?: DecodeResult<Key>;
    value: DecodeResult<Value>;
  }> {
    return {
      value: await this.valueSubject.decode<Value>(message.value),
      key: message.key
        ? await this.keySubject.decode<Key>(message.key)
        : undefined,
    };
  }

  async encodeMessageData<
    Key extends SchemaObject = SchemaObject,
    Value extends SchemaObject = SchemaObject
  >(message: {
    key?: Key | null;
    value: Value;
  }): Promise<{
    key?: EncodeResult<Key>;
    value: EncodeResult<Value>;
  }> {
    return {
      value: await this.valueSubject.encode<Value>(message.value),
      key: message.key
        ? await this.keySubject.encode<Key>(message.key)
        : undefined,
    };
  }
}
