import { KafkaChannel } from './KafkaChannel';
import { AbstractChannelFactory } from '@ts-messaging/client';
import { Registry } from '@ts-messaging/common';
import { KafkaBroker } from '../broker';

export class KafkaChannelFactory extends AbstractChannelFactory {
  constructor(
    protected readonly broker: KafkaBroker,
    protected readonly registry: Registry
  ) {
    super();
  }
  async produce(input: { name: string }): Promise<KafkaChannel> {
    const topics = await this.broker.admin.listTopics();

    if (!topics.includes(input.name)) {
      if (!this.broker.autoRegisterChannels) {
        throw new Error(`Topic ${input.name} does not exist!`);
      }

      await this.broker.admin.createTopics({
        topics: [
          {
            topic: input.name,
          },
        ],
      });
    }

    return new KafkaChannel({
      name: input.name,
      registry: this.registry,
    });
  }
}
