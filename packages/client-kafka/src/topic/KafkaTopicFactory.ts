import { KafkaTopic } from './KafkaTopic';
import { AbstractTopicFactory } from '@ts-messaging/client';
import { Registry } from '@ts-messaging/common';
import { Kafka } from '../Kafka';

export class KafkaTopicFactory extends AbstractTopicFactory {
  constructor(
    protected readonly kafka: Kafka,
    protected readonly registry: Registry
  ) {
    super();
  }
  async produce(input: { name: string }): Promise<KafkaTopic> {
    const topics = await this.kafka.admin.listTopics();

    if (!topics.includes(input.name)) {
      if (!this.kafka.autoRegisterTopics) {
        throw new Error(`Topic ${input.name} does not exist!`);
      }

      await this.kafka.admin.createTopics({
        topics: [
          {
            topic: input.name,
          },
        ],
      });
    }

    const keySubject = await this.registry.findSubject(input.name + '-key');

    if (!keySubject) {
      throw new Error(`Key subject for topic ${input.name} does not exist!`);
    }

    const valueSubject = await this.registry.findSubject(input.name + '-value');

    if (!valueSubject) {
      throw new Error(`Value subject for topic ${input.name} does not exist!`);
    }

    return new KafkaTopic({
      keySubject,
      valueSubject,
      ...input,
    });
  }
}
