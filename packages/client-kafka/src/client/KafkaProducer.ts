import { KafkaMessage } from '../KafkaMessage';
import type {
  Message as MessageKafkaJs,
  Producer as KafkaJsProducer,
  ProducerRecord,
  RecordMetadata,
} from 'kafkajs';
import { AbstractProducer } from '@ts-messaging/client';
import { Injectable, Logger, LoggerChild } from '@ts-messaging/common';

@Injectable()
export class KafkaProducer extends AbstractProducer {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaProducer',
    uuid: this.__uid,
  });

  constructor(private readonly producer: KafkaJsProducer) {
    super();
  }

  /**
   * Made simple: Produce a message in a topic.
   *
   * @param message
   * @param options
   */
  async produce(
    message: KafkaMessage,
    options?: Exclude<ProducerRecord, 'messages' | 'topic'>
  ): Promise<RecordMetadata[]> {
    const processedMessage = await this.processMessage(message);

    return this.producer.send({
      topic: message.topic.name,
      messages: [processedMessage],
      ...options,
    });
  }

  private async processMessage(message: KafkaMessage): Promise<MessageKafkaJs> {
    const encoded = await message.topic.encodeMessageData(message.data);

    return {
      key: encoded.key?.result,
      value: encoded.value.result,
      headers: message.meta.headers,
      timestamp: message.meta.timestamp,
      partition: message.meta.partition,
    };
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
