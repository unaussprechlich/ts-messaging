import { BaseClass, Channel, Contract } from '@ts-messaging/common';

export abstract class AbstractChannel extends BaseClass implements Channel {
  abstract readonly name: string;

  protected contract: Promise<Contract | null> | undefined;
  protected abstract loadContract(): Promise<Contract | null>;

  async findContract(): Promise<Contract | null> {
    if (this.contract) {
      return this.contract;
    }

    this.contract = this.loadContract();

    const value = await this.contract;

    if (!value) {
      this.contract = undefined;
    }

    return value;
  }
}
