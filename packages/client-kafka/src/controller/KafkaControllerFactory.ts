import { KafkaConsumer } from '../client';
import { KafkaController, KafkaMessageEndpoint } from './KafkaController';
import {
  Constructor,
  LoggerChild,
  Logger,
  ContainerDI,
} from '@ts-messaging/common';
import { AbstractControllerFactory } from '@ts-messaging/client';
import {
  KafkaControllerReflections,
  KafkaEndpointReflections,
  KafkaEndpointReflectionType,
  KafkaInjectClientReflections,
  KafkaOnErrorReflections,
} from './decorators';
import { Kafka } from '../Kafka';

export class KafkaControllerFactory extends AbstractControllerFactory {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaControllerFactory',
    uuid: this.__uid,
  });

  constructor(
    protected readonly kafka: Kafka,
    protected readonly container: ContainerDI
  ) {
    super();
  }

  async produce(target: Constructor): Promise<KafkaController> {
    const controllerName = target.name;

    const targetInstance = new target();

    this.injectResources(targetInstance);

    const consumer = this.getConsumer(target);
    const endpoints = await this.processEndpoints(
      controllerName,
      targetInstance,
      consumer
    );

    return new KafkaController(
      target.name,
      consumer,
      endpoints,
      this.extractErrorHandler(targetInstance)
    );
  }

  private extractErrorHandler(targetInstance: any) {
    const useReflect = KafkaOnErrorReflections.useReflect(
      targetInstance.constructor
    );

    if (useReflect?.handler) {
      const handler = targetInstance[useReflect.handler];
      return handler.bind(targetInstance);
    } else {
      return null;
    }
  }

  private injectResources(targetInstance: any) {
    const maybeInjectClient = KafkaInjectClientReflections.useReflect(
      targetInstance.constructor
    );

    if (maybeInjectClient?.injectClientKey) {
      targetInstance[maybeInjectClient.injectClientKey] = this.kafka;
    }
  }

  private getConsumer(target: Constructor) {
    const reflect = KafkaControllerReflections.useSafeReflectWithError(target);
    return reflect.consumerConfig
      ? this.kafka.createConsumer(reflect.consumerConfig)
      : this.kafka.consumer;
  }

  private async processEndpoints(
    controllerName: string,
    targetInstance: any,
    consumer: KafkaConsumer
  ) {
    const endpoints: KafkaMessageEndpoint[] = [];
    const prototype = Object.getPrototypeOf(targetInstance);

    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (key === 'constructor') {
        continue;
      }

      const reflectedEndpoint = KafkaEndpointReflections.useReflect(prototype, {
        targetKey: key,
      });

      if (!reflectedEndpoint) {
        continue;
      }

      const endpoint = await this.processEndpoint(
        reflectedEndpoint,
        targetInstance[key].bind(targetInstance),
        consumer
      );

      endpoints.push(endpoint);
    }

    return endpoints;
  }

  private async processEndpoint(
    reflectedEndpoint: KafkaEndpointReflectionType,
    endpointFn: (...args: any) => Promise<void>,
    consumer: KafkaConsumer
  ) {
    const topicName = reflectedEndpoint.topicName;

    const endpoint: KafkaMessageEndpoint = {
      topicName: reflectedEndpoint.topicName,
      name: endpointFn.name,
      params: Object.values(reflectedEndpoint.params),
      schema: {
        key: [],
        value: [],
      },
      endpoint: endpointFn,
    };

    const topic = await this.kafka.findTopicWithError(topicName);
    await consumer.subscribe([topic]);

    if (reflectedEndpoint.params.value?.designType) {
      const schema =
        await topic.valueSubject.findSchemaBySchemaObjectConstructor(
          reflectedEndpoint.params.value.designType,
          {
            autoRegister: reflectedEndpoint.params.value.config?.autoRegister,
          }
        );
      if (schema) {
        endpoint.schema.value.push(schema.schema.__id);
      }
    }

    if (reflectedEndpoint.params.key?.designType) {
      const schema = await topic.keySubject.findSchemaBySchemaObjectConstructor(
        reflectedEndpoint.params.key.designType,
        {
          autoRegister: reflectedEndpoint.params.key.config?.autoRegister,
        }
      );
      if (schema) {
        endpoint.schema.key.push(schema.schema.__id);
      }
    }

    return endpoint;
  }
}
