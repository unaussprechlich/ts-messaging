import {
  BaseClass,
  Cache,
  Broker,
  Consumer,
  Producer,
  Channel,
} from '@ts-messaging/common';

export abstract class AbstractBroker<TChannel extends Channel>
  extends BaseClass
  implements Broker
{
  protected readonly channelCache = new Cache<string, TChannel>((key: string) =>
    this.loadChannel(key)
  );

  protected abstract loadChannel(topicName: string): Promise<TChannel | null>;

  async findChannel(name: string): Promise<TChannel | null> {
    return this.channelCache.find(name);
  }

  async findChannelWithError(name: string): Promise<TChannel> {
    const topic = await this.findChannel(name);

    if (!topic) {
      throw new Error(`Channel ${name} does not exist!`);
    }

    return topic;
  }

  abstract createConsumer(config: unknown): Consumer;
  abstract createProducer(config: unknown): Producer;

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
