import {
  Admin,
  AdminConfig,
  ConsumerConfig,
  Kafka as KafkaJs,
  KafkaConfig,
  ProducerConfig,
} from 'kafkajs';
import { KafkaConsumer } from './KafkaConsumer';
import { KafkaProducer } from './KafkaProducer';
import { KafkaMessage } from '../KafkaMessage';
import { AbstractClient } from '@ts-messaging/client';
import { Logger, LoggerChild, SchemaObject } from '@ts-messaging/common';
import { KafkaConsumerFactory } from './KafkaConsumerFactory';
import { KafkaTopic, KafkaTopicFactory } from '../topic';

export abstract class KafkaClient
  extends AbstractClient<KafkaTopic>
  implements KafkaConsumerFactory
{
  readonly kafka: KafkaJs;
  readonly producer: KafkaProducer;
  readonly consumer: KafkaConsumer;
  readonly admin: Admin;
  protected readonly consumers: KafkaConsumer[] = [];
  protected readonly producers: KafkaProducer[] = [];

  protected abstract readonly topicFactory: KafkaTopicFactory;

  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaClient',
    uuid: this.__uid,
  });

  protected constructor(config: {
    broker: KafkaConfig;
    producer?: ProducerConfig;
    consumer: ConsumerConfig;
    admin?: AdminConfig;
  }) {
    super();
    this.kafka = new KafkaJs(config.broker);

    this.consumer = this.createConsumer(config.consumer);
    this.producer = this.createProducer(config.producer ?? {});
    this.admin = this.kafka.admin(config.admin ?? {});
  }

  createConsumer(config: ConsumerConfig): KafkaConsumer {
    const consumer = new KafkaConsumer(this.kafka.consumer(config));
    this.consumers.push(consumer);
    return consumer;
  }

  createProducer(config: ProducerConfig): KafkaProducer {
    const producer = new KafkaProducer(this.kafka.producer(config));
    this.producers.push(producer);
    return producer;
  }

  async produce<Key extends SchemaObject, Value extends SchemaObject>(message: {
    topic: string;
    data: {
      key?: Key;
      value: Value;
    };
  }) {
    const topic = await this.findTopic(message.topic);

    if (!topic) {
      throw this.logger.proxyError(
        new Error(`Could not find topic ${message.topic} in the registry`)
      );
    }

    const kafkaMessage = new KafkaMessage({
      topic: topic,
      data: message.data,
    });

    return this.producer.produce(kafkaMessage);
  }

  async internalInit() {
    await Promise.all([
      ...this.consumers.map((c) => c.init()),
      ...this.producers.map((c) => c.init()),
    ]);
    this.logger.info('KafkaClient initialized!');
  }

  async connect() {
    await Promise.all([
      ...this.consumers.map((c) => c.connect()),
      ...this.producers.map((c) => c.connect()),
      this.admin.connect(),
    ]);
    this.logger.info('KafkaClient connected!');
  }

  async disconnect() {
    await Promise.all([
      ...this.consumers.map((c) => c.disconnect()),
      ...this.producers.map((c) => c.disconnect()),
      this.admin.disconnect(),
    ]);
    this.logger.info('KafkaClient disconnected!');
  }
}
