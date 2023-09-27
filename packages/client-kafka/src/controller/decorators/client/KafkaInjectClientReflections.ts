import type { ConsumerConfig } from 'kafkajs';
import { ReflectionHelper } from '@ts-messaging/common';
import { KafkaEndpointReflectionType } from '../endpoint';

export const KafkaInjectClientReflections = new ReflectionHelper<{
  injectClientKey: string;
}>('@ts-messaging/client-kafka::InjectClient');
