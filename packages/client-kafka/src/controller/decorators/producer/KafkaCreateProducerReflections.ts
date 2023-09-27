import type { ProducerConfig } from 'kafkajs';
import { ReflectionHelper } from '@ts-messaging/common';

export const KafkaCreateProducerReflections = new ReflectionHelper<
  {
    key: string;
    config: ProducerConfig;
  }[]
>('@ts-messaging/client-kafka::CreateProducer', () => []);
