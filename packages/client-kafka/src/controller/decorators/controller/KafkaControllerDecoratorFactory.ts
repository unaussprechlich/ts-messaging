import type { ConsumerConfig } from 'kafkajs';
import {
  KafkaControllerEndpointsReflections,
  KafkaControllerReflections,
} from './KafkaControllerReflections';

export function KafkaControllerDecoratorFactory(config?: {
  consumer?: ConsumerConfig;
}) {
  return function decorator<Target extends object>(target: Target) {
    KafkaControllerReflections.annotate(target, {
      consumerConfig: config?.consumer ?? null,
      endpoints:
        KafkaControllerEndpointsReflections.useSafeReflectWithDefault(target),
    });
  };
}
