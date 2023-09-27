import { KafkaConsumer } from '../broker';
import { KafkaMessage } from '../KafkaMessage';
import {
  ContractVersion,
  Logger,
  LoggerChild,
  MessageEndpoint,
} from '@ts-messaging/common';
import { AbstractController } from '@ts-messaging/client';
import { KafkaParamsReflectionType } from './decorators';

export interface KafkaMessageEndpoint extends MessageEndpoint {
  keyContractVersion: ContractVersion | null;
  params: KafkaParamsReflectionType[];
  designTypes: {
    key?: any;
    payload?: any;
  };
}

export interface KafkaController {}

export class KafkaInternalController extends AbstractController {
  readonly name: string;
  readonly consumer: KafkaConsumer;

  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: `KafkaController:${this.name}`,
    uuid: this.__uid,
  });
  protected readonly endpointRegistry: Map<string, KafkaMessageEndpoint[]> =
    new Map();

  constructor(
    name: string,
    consumer: KafkaConsumer,
    endpoints: KafkaMessageEndpoint[]
  ) {
    super();
    for (const endpoint of endpoints) {
      const endpoints = this.endpointRegistry.get(endpoint.channel.name) ?? [];
      endpoints.push(endpoint);
      this.endpointRegistry.set(endpoint.channel.name, endpoints);
    }

    this.name = name;
    this.consumer = consumer;
    this.consumer.registerController(this);
  }

  /**
   * This method is called by the consumer when a message is received. It will automatically handel the distribution of
   * the message to the endpoints.
   * @param message
   */
  async handleMessage(message: KafkaMessage): Promise<{
    invocations: number;
  }> {
    let invocations = 0;
    const endpoints = this.endpointRegistry.get(message.channel.name);

    if (!endpoints || endpoints.length === 0) {
      return {
        invocations,
      };
    }

    for (const {
      keyContractVersion,
      payloadContractVersion,
      endpoint,
      params,
      designTypes,
    } of endpoints) {
      if (
        !this.matchContractVersions(
          keyContractVersion,
          message.keyContractVersion
        )
      ) {
        //No match for the key schema
        continue;
      }

      if (
        !this.matchContractVersions(
          payloadContractVersion,
          message.contractVersion
        )
      ) {
        //No match for the value schema
        continue;
      }

      const args = [];

      for (const param of params) {
        switch (param.type) {
          case 'key': {
            if (designTypes.key) {
              args[param.parameterIndex] = this.processWithDesignType(
                message.key,
                designTypes.key
              );
            } else {
              args[param.parameterIndex] = message.key;
            }

            break;
          }

          case 'value': {
            if (designTypes.payload) {
              args[param.parameterIndex] = this.processWithDesignType(
                message.payload,
                designTypes.payload
              );
            } else {
              args[param.parameterIndex] = message.payload;
            }
            break;
          }

          case 'headers':
            args[param.parameterIndex] = message.meta.headers;
            break;
          case 'metadata':
            args[param.parameterIndex] = message.meta;
            break;
          default:
            throw new Error(`Unsupported param type: ${param.type}`);
        }
      }
      await endpoint(...args);
      invocations++;
    }

    return {
      invocations,
    };
  }

  /**
   * Move the metadata and constructor metadata to the target this is required to
   * resolve the design types and annotate the object for future use with the already known schema.
   * @param source
   * @param DesignType
   * @private
   */
  private processWithDesignType(source: any, DesignType: any) {
    //Move the data
    const target = Object.assign(new DesignType(), source);

    //Move Metadata to Constructor if not already defined
    for (const reflectionKey of Reflect.getMetadataKeys(source)) {
      if (Reflect.hasMetadata(reflectionKey, source.constructor)) {
        continue;
      }
      Reflect.defineMetadata(
        reflectionKey,
        Reflect.getMetadata(reflectionKey, source),
        target.constructor
      );
    }
    //Move constructor Metadata if not already defined
    for (const reflectionKey of Reflect.getMetadataKeys(source.constructor)) {
      if (Reflect.hasMetadata(reflectionKey, source.constructor)) {
        continue;
      }
      Reflect.defineMetadata(
        reflectionKey,
        Reflect.getMetadata(reflectionKey, source),
        target.constructor
      );
    }
    return Object.seal(target);
  }

  /**
   * Check if the schema matches always matched if not schema is defined.
   * @private
   * @param endpoint
   * @param message
   */
  private matchContractVersions(
    endpoint: ContractVersion | null | undefined,
    message: ContractVersion | null | undefined
  ) {
    if (endpoint === null) {
      return true;
    }

    return endpoint?.schema.__id === message?.schema.__id;
  }
}
