import { Logger, LoggerChild, Contract, Registry } from '@ts-messaging/common';
import { AbstractChannel } from '@ts-messaging/client';

export class KafkaChannel extends AbstractChannel {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaChannel',
    uuid: this.__uid,
  });
  readonly name: string;
  protected keyContract: Promise<Contract | null> | undefined;

  readonly registry: Registry;

  constructor(config: { name: string; registry: Registry }) {
    super();
    this.name = config.name;
    this.registry = config.registry;
  }

  protected async loadContract(): Promise<Contract | null> {
    return this.registry.findContract(this.name + '-value');
  }

  async findKeyContract(): Promise<Contract | null> {
    if (this.keyContract) {
      return this.keyContract;
    }

    this.keyContract = this.registry.findContract(this.name + '-key');

    const value = await this.keyContract;

    if (!value) {
      this.keyContract = undefined;
    }

    return value;
  }
}
