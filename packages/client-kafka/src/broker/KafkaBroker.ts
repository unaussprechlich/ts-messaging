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
import { Logger, LoggerChild, Registry } from '@ts-messaging/common';
import { KafkaConsumerFactory } from './KafkaConsumerFactory';
import { KafkaChannel, KafkaChannelFactory } from '../channel';
import { AbstractBroker } from '@ts-messaging/client';
import { KafkaMessageFactory } from '../KafkaMessageFactory';

export class KafkaBroker
  extends AbstractBroker<KafkaChannel>
  implements KafkaConsumerFactory
{
  readonly kafka: KafkaJs;
  readonly defaultProducer: KafkaProducer;
  readonly defaultConsumer: KafkaConsumer;
  readonly admin: Admin;
  protected readonly consumers: KafkaConsumer[] = [];
  protected readonly producers: KafkaProducer[] = [];

  protected readonly channelFactory: KafkaChannelFactory;
  protected readonly messageFactory = new KafkaMessageFactory(this);

  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaBroker',
    uuid: this.__uid,
  });

  autoRegisterChannels: boolean;

  async loadChannel(topicName: string): Promise<KafkaChannel> {
    return this.channelFactory.produce({ name: topicName });
  }

  constructor(
    registry: Registry,
    config: {
      broker: KafkaConfig;
      producer?: ProducerConfig;
      consumer?: ConsumerConfig;
      admin?: AdminConfig;
      autoRegisterChannels?: boolean;
    }
  ) {
    super();
    this.kafka = new KafkaJs(config.broker);
    this.autoRegisterChannels = config.autoRegisterChannels ?? false;
    this.channelFactory = new KafkaChannelFactory(this, registry);

    this.defaultProducer = this.createProducer(config.producer ?? {});
    this.defaultConsumer = this.createConsumer(
      config.consumer ?? {
        groupId: 'default',
      }
    );
    this.admin = this.kafka.admin(config.admin ?? {});
  }

  createConsumer(config: ConsumerConfig): KafkaConsumer {
    const consumer = new KafkaConsumer(this.kafka.consumer(config));
    this.consumers.push(consumer);
    return consumer;
  }

  createProducer(config: ProducerConfig): KafkaProducer {
    const producer = new KafkaProducer(
      this.kafka.producer(config),
      this.messageFactory
    );
    this.producers.push(producer);
    return producer;
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
