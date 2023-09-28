import { BaseClass, Consumer, Controller, Channel } from '@ts-messaging/common';

export abstract class AbstractConsumer extends BaseClass implements Consumer {
  protected readonly controllers: Controller[] = [];

  registerController(controller: Controller): void {
    this.controllers.push(controller);
  }

  protected initPromise: Promise<void> | undefined;
  protected abstract internalInit(): Promise<void>;

  async init() {
    if (!this.initPromise) {
      this.initPromise = this.internalInit();
    }

    return this.initPromise;
  }

  abstract subscribe(channels: Channel[]): Promise<void>;
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
}
