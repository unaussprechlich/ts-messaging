import type {
  Producer as KafkaJsProducer,
  ProducerRecord,
  RecordMetadata,
} from 'kafkajs';
import { AbstractProducer } from '@ts-messaging/client';
import { Logger, LoggerChild } from '@ts-messaging/common';
import { KafkaMessageFactory } from '../KafkaMessageFactory';
import { IHeaders } from 'kafkajs';

export class KafkaProducer extends AbstractProducer {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaProducer',
    uuid: this.__uid,
  });

  constructor(
    private readonly producer: KafkaJsProducer,
    private readonly messageFactory: KafkaMessageFactory
  ) {
    super();
  }

  /**
   * Made simple: Produce a message in a topic.
   *
   * @param message
   */
  async produce(message: {
    channel: string;
    payload: any;
    key?: any;
    partition?: number;
    headers?: IHeaders;
    timestamp?: string;
    options?: Exclude<ProducerRecord, 'messages' | 'topic'>;
  }): Promise<RecordMetadata[]> {
    const kafkaMessage = await this.messageFactory.produce(message);

    return this.producer.send({
      messages: [kafkaMessage.toKafkaJsMessage()],
      topic: kafkaMessage.channel.name,
      ...message.options,
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    this.logger.info(`Connected to Kafka!`);
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.logger.info(`Disconnected from Kafka!`);
  }

  async internalInit(): Promise<void> {
    // Do nothing
  }
}
