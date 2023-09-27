import { KafkaBroker } from './broker';
import {
  AdminConfig,
  ConsumerConfig,
  KafkaConfig,
  ProducerConfig,
} from 'kafkajs';
import {
  KafkaInternalController,
  KafkaControllerDecoratorFactory,
  KafkaControllerFactory,
  KafkaEndpointDecoratorFactory,
  KafkaEndpointParamHeadersDecoratorFactory,
  KafkaEndpointParamKeyDecoratorFactory,
  KafkaEndpointParamMetadataDecoratorFactory,
  KafkaEndpointParamValueDecoratorFactory,
  KafkaInjectClientDecoratorFactory,
  KafkaController,
  KafkaCreateProducerDecoratorFactory,
} from './controller';
import { Client, Constructor, RegistryEntrypoint } from '@ts-messaging/common';

export class Kafka implements Client {
  static readonly TYPENAME = '@ts-messaging/client-kafka';
  static readonly INJECT_TOKEN: symbol = Symbol('@ts-messaging/client-kafka');
  readonly INJECT_TOKEN: symbol = Kafka.INJECT_TOKEN;
  readonly TYPENAME: string = Kafka.TYPENAME;

  private readonly controllerConstructors: Constructor<KafkaController>[];
  private readonly controllers: KafkaInternalController[] = [];

  protected readonly controllerFactory: KafkaControllerFactory;

  readonly broker: KafkaBroker;
  readonly registry: RegistryEntrypoint;

  constructor(config: {
    broker: KafkaConfig;
    producer?: ProducerConfig;
    consumer?: ConsumerConfig;
    admin?: AdminConfig;
    registry: RegistryEntrypoint;
    controllers: Constructor<KafkaController>[];
    autoRegisterChannels?: boolean;
  }) {
    this.registry = config.registry;
    this.broker = new KafkaBroker(config.registry, {
      broker: config.broker,
      producer: config.producer,
      consumer: config.consumer,
      admin: config.admin,
      autoRegisterChannels: config.autoRegisterChannels,
    });

    this.controllerConstructors = config.controllers;
    this.controllerFactory = new KafkaControllerFactory(this.broker);
  }

  protected async internalInit(): Promise<void> {
    await this.registry.init();

    for (const controllerConstructor of this.controllerConstructors) {
      const controller = await this.controllerFactory.produce(
        controllerConstructor
      );
      this.controllers.push(controller);
    }

    await this.broker.init();
  }

  protected initPromise: Promise<void> | undefined;
  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.internalInit();
    }

    return this.initPromise;
  }

  async connect(): Promise<void> {
    await this.broker.connect();
  }

  async disconnect(): Promise<void> {
    await this.broker.disconnect();
  }

  static readonly Controller = KafkaControllerDecoratorFactory;
  static readonly Endpoint = KafkaEndpointDecoratorFactory;
  static readonly InjectClient = KafkaInjectClientDecoratorFactory;
  static readonly Producer = KafkaCreateProducerDecoratorFactory;

  static readonly Key = KafkaEndpointParamKeyDecoratorFactory;
  static readonly Payload = KafkaEndpointParamValueDecoratorFactory;
  static readonly Headers = KafkaEndpointParamHeadersDecoratorFactory;
  static readonly Metadata = KafkaEndpointParamMetadataDecoratorFactory;
}
