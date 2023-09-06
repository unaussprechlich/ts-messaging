import { KafkaConsumer } from '../client';
import { KafkaMessage } from '../KafkaMessage';
import { Logger, LoggerChild, MessageEndpoint } from '@ts-messaging/common';
import { AbstractController } from '@ts-messaging/client';
import { KafkaParamsReflectionType } from './decorators';
import { KafkaTopic } from '../topic';

export type ErrorHandler = (
  topic: KafkaTopic,
  message: KafkaMessage,
  error: Error | unknown
) => Promise<boolean>;

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
  protected readonly onErrorHandler: ErrorHandler | null;

  constructor(
    name: string,
    consumer: KafkaConsumer,
    endpoints: KafkaMessageEndpoint[],
    onErrorHandler: ErrorHandler | null
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

  /**
   * This method is called by the consumer when a message is received. It will automatically handel the distribution of
   * the message to the endpoints.
   * @param message
   */
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
      if (!this.matcheSchema(schema.key, message.schema?.key?.__id ?? null)) {
        //No match for the key schema
        continue;
      }

      if (
        !this.matcheSchema(schema.value, message.schema?.value?.__id ?? null)
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
   * @param callbackSchema
   * @param messageSchema
   * @private
   */
  private matcheSchema(callbackSchema: number[], messageSchema: number | null) {
    if (callbackSchema.length === 0) {
      return true;
    } else if (messageSchema === null) {
      return false;
    } else {
      return callbackSchema.includes(messageSchema);
    }
  }

  /**
   * Calls the error handler of the controller if defined otherwise throws the error.
   * @param topic
   * @param message
   * @param error
   */
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
