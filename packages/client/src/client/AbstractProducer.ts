import { BaseClass, Message, Producer } from '@ts-messaging/common';

export abstract class AbstractProducer extends BaseClass implements Producer {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract produce(message: any): Promise<any>;

  protected initPromise: Promise<void> | undefined;
  protected abstract internalInit(): Promise<void>;

  async init() {
    if (!this.initPromise) {
      this.initPromise = this.internalInit();
    }

    return this.initPromise;
  }
}
