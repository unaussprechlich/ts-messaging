import { Injectable, Topic, TopicFactory } from '@ts-messaging/common';

export abstract class AbstractTopicFactory implements TopicFactory {
  abstract produce(input: { name: string }): Promise<Topic>;
}
