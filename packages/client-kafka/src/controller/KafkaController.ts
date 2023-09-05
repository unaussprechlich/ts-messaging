import { KafkaConsumer } from '../client';
import { KafkaMessage } from '../KafkaMessage';
import {
  Injectable,
  Logger,
  LoggerChild,
  MessageEndpoint,
} from '@ts-messaging/common';
import { AbstractController } from '@ts-messaging/client';
import { KafkaParamsReflectionType } from './decorators';
import { KafkaTopic } from '../topic';
import 'reflect-metadata';

export interface KafkaMessageEndpoint extends MessageEndpoint<KafkaMessage> {
  topicName: string;
  name: string;
  schema: {
    key: number[];
    value: number[];
  };
  params: KafkaParamsReflectionType[];
  designTypes: {
    key?: any;
    value?: any;
  };
  endpoint: (...args: any) => Promise<void>;
}

@Injectable()
export class KafkaController extends AbstractController {
  readonly name: string;
  readonly consumer: KafkaConsumer;
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: `KafkaController:${this.name}`,
    uuid: this.__uid,
  });

  protected readonly endpointRegistry: Map<string, KafkaMessageEndpoint[]> =
    new Map();

  protected readonly onErrorHandler:
    | ((
        topic: KafkaTopic,
        message: KafkaMessage,
        error: Error | unknown
      ) => Promise<boolean>)
    | null;

  constructor(
    name: string,
    consumer: KafkaConsumer,
    endpoints: KafkaMessageEndpoint[],
    onErrorHandler:
      | ((
          topic: KafkaTopic,
          message: KafkaMessage,
          error: Error | unknown
        ) => Promise<boolean>)
      | null
  ) {
    super();
    for (const endpoint of endpoints) {
      const endpoints = this.endpointRegistry.get(endpoint.topicName) ?? [];
      endpoints.push(endpoint);
      this.endpointRegistry.set(endpoint.topicName, endpoints);
    }

    this.name = name;
    this.consumer = consumer;
    this.consumer.registerController(this);

    this.onErrorHandler = onErrorHandler;
  }

  async handleMessage(message: KafkaMessage): Promise<{
    invocations: number;
  }> {
    let invocations = 0;
    const endpoints = this.endpointRegistry.get(message.topic.name);

    if (!endpoints || endpoints.length === 0) {
      return {
        invocations,
      };
    }

    for (const { schema, endpoint, params, designTypes } of endpoints) {
      //No match for the key schema
      if (!this.matcheSchema(schema.key, message.schema?.key?.__id ?? null)) {
        continue;
      }

      //No match for the value schema
      if (
        !this.matcheSchema(schema.value, message.schema?.value?.__id ?? null)
      ) {
        continue;
      }

      const args = [];

      for (const param of params) {
        switch (param.type) {
          case 'key': {
            if (designTypes.key) {
              args[param.parameterIndex] = this.processWithDesignType(
                message.data.key,
                designTypes.key
              );
            } else {
              args[param.parameterIndex] = message.data.key;
            }

            break;
          }

          case 'value': {
            if (designTypes.value) {
              args[param.parameterIndex] = this.processWithDesignType(
                message.data.value,
                designTypes.value
              );
            } else {
              args[param.parameterIndex] = message.data.value;
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

  private processWithDesignType(source: any, DesignType: any) {
    const target = Object.assign(new DesignType(), source);
    //Metadata
    for (const reflectionKey of Reflect.getMetadataKeys(source)) {
      Reflect.defineMetadata(
        reflectionKey,
        Reflect.getMetadata(reflectionKey, source),
        target
      );
    }
    //Constructor Metadata
    for (const reflectionKey of Reflect.getMetadataKeys(source.constructor)) {
      Reflect.defineMetadata(
        reflectionKey,
        Reflect.getMetadata(reflectionKey, source),
        target.constructor
      );
    }
    return target;
  }

  private matcheSchema(callbackSchema: number[], messageSchema: number | null) {
    if (callbackSchema.length === 0) {
      return true;
    } else if (messageSchema === null) {
      return false;
    } else {
      return callbackSchema.includes(messageSchema);
    }
  }

  async handleError(
    topic: KafkaTopic,
    message: KafkaMessage,
    error: Error | unknown
  ): Promise<boolean> {
    if (this.onErrorHandler) {
      return this.onErrorHandler(topic, message, error);
    } else {
      throw error;
    }
  }
}
