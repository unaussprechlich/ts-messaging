import {
  KafkaController,
  KafkaInternalController,
  KafkaMessageEndpoint,
} from './KafkaInternalController';
import { Constructor, LoggerChild, Logger } from '@ts-messaging/common';
import { AbstractControllerFactory } from '@ts-messaging/client';
import {
  KafkaControllerReflections,
  KafkaCreateProducerReflections,
  KafkaEndpointReflections,
  KafkaEndpointReflectionType,
  KafkaInjectClientReflections,
} from './decorators';
import { KafkaBroker, KafkaConsumer } from '../broker';

export class KafkaControllerFactory extends AbstractControllerFactory {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaControllerFactory',
    uuid: this.__uid,
  });

  constructor(protected readonly kafka: KafkaBroker) {
    super();
  }

  async produce(
    target: Constructor<KafkaController>
  ): Promise<KafkaInternalController> {
    const controllerName = target.name;

    const targetInstance = new target();

    this.injectResources(targetInstance);

    const consumer = this.getConsumer(target);
    const endpoints = await this.processEndpoints(
      controllerName,
      targetInstance,
      consumer
    );

    return new KafkaInternalController(target.name, consumer, endpoints);
  }

  private injectResources(targetInstance: any) {
    const maybeInjectClient = KafkaInjectClientReflections.useReflect(
      targetInstance.constructor
    );

    if (maybeInjectClient?.injectClientKey) {
      targetInstance[maybeInjectClient.injectClientKey] = this.kafka;
    }

    const createProducers =
      KafkaCreateProducerReflections.useSafeReflectWithDefault(
        targetInstance.constructor
      );

    for (const createProducer of createProducers) {
      targetInstance[createProducer.key] = this.kafka.createProducer(
        createProducer.config
      );
    }
  }

  private getConsumer(target: Constructor) {
    const reflect = KafkaControllerReflections.useSafeReflectWithError(target);
    return reflect.consumerConfig
      ? this.kafka.createConsumer(reflect.consumerConfig)
      : this.kafka.defaultConsumer;
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
    const channel = await this.kafka.findChannelWithError(
      reflectedEndpoint.channelName
    );
    const contract = await channel.findContract();
    const keyContract = await channel.findKeyContract();

    const endpoint: KafkaMessageEndpoint = {
      channel: channel,
      name: endpointFn.name,
      params: Object.values(reflectedEndpoint.params),
      payloadContractVersion: null,
      keyContractVersion: null,
      designTypes: {},
      endpoint: endpointFn,
    };

    await consumer.subscribe([channel]);

    if (contract && reflectedEndpoint.params.value?.designType) {
      const contractVersion =
        await contract.findSchemaBySchemaObjectConstructor(
          reflectedEndpoint.params.value.designType,
          {
            autoRegister: reflectedEndpoint.params.value.config?.autoRegister,
          }
        );
      if (contractVersion) {
        endpoint.payloadContractVersion = contractVersion;
        endpoint.designTypes.payload =
          reflectedEndpoint.params.value.designType;
      }
    }

    if (keyContract && reflectedEndpoint.params.key?.designType) {
      const contractVersion =
        await keyContract.findSchemaBySchemaObjectConstructor(
          reflectedEndpoint.params.key.designType,
          {
            autoRegister: reflectedEndpoint.params.key.config?.autoRegister,
          }
        );
      if (contractVersion) {
        endpoint.keyContractVersion = contractVersion;
        endpoint.designTypes.key = reflectedEndpoint.params.key.designType;
      }
    }

    return endpoint;
  }
}
