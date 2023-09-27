import { ConsumerFactory } from '@ts-messaging/common';
import type { ConsumerConfig } from 'kafkajs';
import { KafkaConsumer } from './KafkaConsumer';

export interface KafkaConsumerFactory extends ConsumerFactory {
  createConsumer(config: ConsumerConfig): KafkaConsumer;
}
