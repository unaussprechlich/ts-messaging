import { KafkaTopic } from './KafkaTopic';
import { AbstractTopicFactory } from '@ts-messaging/client';
import { Registry } from '@ts-messaging/common';
import { Admin } from 'kafkajs';

export class KafkaTopicFactory extends AbstractTopicFactory {
  constructor(
    protected readonly admin: Admin,
    protected readonly registry: Registry
  ) {
    super();
  }
  async produce(input: { name: string }): Promise<KafkaTopic> {
    const topics = await this.admin.listTopics();

    if (!topics.includes(input.name)) {
      throw new Error(`Topic ${input.name} does not exist!`);
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
