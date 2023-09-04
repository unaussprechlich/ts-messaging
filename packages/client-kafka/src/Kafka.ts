import { KafkaClient } from './client';
import {
  AdminConfig,
  ConsumerConfig,
  KafkaConfig,
  ProducerConfig,
} from 'kafkajs';
import {
  KafkaController,
  KafkaControllerDecoratorFactory,
  KafkaControllerFactory,
  KafkaEndpointDecoratorFactory,
  KafkaEndpointParamHeadersDecoratorFactory,
  KafkaEndpointParamKeyDecoratorFactory,
  KafkaEndpointParamMetadataDecoratorFactory,
  KafkaEndpointParamValueDecoratorFactory,
  KafkaInjectClientDecoratorFactory,
  KafkaOnErrorDecoratorFactory,
} from './controller';
import {
  ClientEntrypoint,
  Constructor,
  ContainerDI,
  Injectable,
  INJECTABLES,
  RegistryEntrypoint,
} from '@ts-messaging/common';
import { KafkaTopic, KafkaTopicFactory } from './topic';

@Injectable()
export class Kafka extends KafkaClient implements ClientEntrypoint {
  static readonly TYPENAME = '@ts-messaging/client-kafka';
  static readonly INJECT_TOKEN: symbol = Symbol('@ts-messaging/client-kafka');
  readonly INJECT_TOKEN: symbol = Kafka.INJECT_TOKEN;
  readonly TYPENAME: string = Kafka.TYPENAME;

  protected readonly controllerFactory: KafkaControllerFactory;
  readonly registry: RegistryEntrypoint;
  private readonly controllerConstructors: Constructor[];
  private readonly controllers: KafkaController[] = [];

  protected readonly topicFactory: KafkaTopicFactory;

  protected readonly container: ContainerDI;

  constructor(config: {
    broker: KafkaConfig;
    consumer: ConsumerConfig;
    producer?: ProducerConfig;
    admin?: AdminConfig;
    registry: RegistryEntrypoint;
    controllers: Constructor[];
  }) {
    super({
      broker: config.broker,
      consumer: config.consumer,
      producer: config.producer,
      admin: config.admin,
    });
    this.container = new ContainerDI();
    this.controllerConstructors = config.controllers;
    this.registry = config.registry;

    this.container.bind(INJECTABLES.client).toConstantValue(this);
    this.container.bind(Kafka.INJECT_TOKEN).toConstantValue(this);

    this.container.bind(INJECTABLES.registry).toConstantValue(this.registry);
    this.container
      .bind(config.registry.INJECT_TOKEN)
      .toConstantValue(this.registry);

    this.controllerFactory = new KafkaControllerFactory(this, this.container);
    this.topicFactory = new KafkaTopicFactory(this.admin, this.registry);
  }

  async loadTopic(topicName: string): Promise<KafkaTopic> {
    return this.topicFactory.produce({ name: topicName });
  }

  override async internalInit(): Promise<void> {
    await this.registry.init();

    for (const controllerConstructor of this.controllerConstructors) {
      const controller = await this.controllerFactory.produce(
        controllerConstructor
      );
      this.controllers.push(controller);
    }

    await super.internalInit();
  }

  static readonly Controller = KafkaControllerDecoratorFactory;
  static readonly Endpoint = KafkaEndpointDecoratorFactory;
  static readonly InjectClient = KafkaInjectClientDecoratorFactory;
  static readonly OnError = KafkaOnErrorDecoratorFactory;

  static readonly Key = KafkaEndpointParamKeyDecoratorFactory;
  static readonly Value = KafkaEndpointParamValueDecoratorFactory;
  static readonly Headers = KafkaEndpointParamHeadersDecoratorFactory;
  static readonly Metadata = KafkaEndpointParamMetadataDecoratorFactory;
}
