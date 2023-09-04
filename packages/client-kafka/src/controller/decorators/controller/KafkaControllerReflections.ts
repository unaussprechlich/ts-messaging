import type { ConsumerConfig } from 'kafkajs';
import { ReflectionHelper } from '@ts-messaging/common';
import { KafkaEndpointReflectionType } from '../endpoint';

export const KafkaControllerReflections = new ReflectionHelper<{
  consumerConfig?: ConsumerConfig | null;
  endpoints: KafkaEndpointReflectionType[];
}>('@ts-messaging/client-kafka::KafkaController');

export const KafkaControllerEndpointsReflections = new ReflectionHelper<
  KafkaEndpointReflectionType[]
>('@ts-messaging/client-kafka::KafkaController.endpoints', () => []);
