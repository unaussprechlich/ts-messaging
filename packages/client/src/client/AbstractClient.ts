import {
  BaseClass,
  Cache,
  Client,
  Consumer,
  Producer,
  Registry,
  SchemaObject,
  Topic,
} from '@ts-messaging/common';

export abstract class AbstractClient<TTopic extends Topic>
  extends BaseClass
  implements Client
{
  abstract readonly consumer: Consumer;
  abstract readonly producer: Producer;
  protected abstract registry: Registry;

  protected readonly topicCache = new Cache<string, TTopic>((key: string) =>
    this.loadTopic(key)
  );

  protected abstract loadTopic(topicName: string): Promise<TTopic | null>;

  async findTopic(topicName: string): Promise<TTopic | null> {
    return this.topicCache.find(topicName);
  }

  async findTopicWithError(topicName: string): Promise<TTopic> {
    const topic = await this.findTopic(topicName);

    if (!topic) {
      throw new Error(`Topic ${topicName} does not exist!`);
    }

    return topic;
  }

  abstract createConsumer(config: any): Consumer;
  abstract createProducer(config: any): Producer;
  abstract produce<
    Key extends SchemaObject,
    Value extends SchemaObject
  >(message: {
    topic: string;
    data: {
      key: Key;
      value: Value;
    };
  }): Promise<any>;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  protected initPromise: Promise<void> | undefined;
  protected abstract internalInit(): Promise<void>;

  async init() {
    if (!this.initPromise) {
      this.initPromise = this.internalInit();
    }

    return this.initPromise;
  }
}
