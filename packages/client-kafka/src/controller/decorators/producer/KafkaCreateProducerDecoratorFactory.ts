import { KafkaCreateProducerReflections } from './KafkaCreateProducerReflections';
import { TargetMatchPropertyType } from '@ts-messaging/common';
import { ProducerConfig } from 'kafkajs';
import { KafkaProducer } from '../../../broker';

export function KafkaCreateProducerDecoratorFactory(config?: ProducerConfig) {
  return function decorator<T extends object>(
    target: T,
    propertyKey: TargetMatchPropertyType<T, KafkaProducer>
  ) {
    if (KafkaCreateProducerReflections.hasMetadata(target.constructor)) {
      throw new Error(
        'KafkaCreateProducerDecoratorFactory: injection key already defined for this controller'
      );
    }

    const reflection = KafkaCreateProducerReflections.useSafeReflectWithDefault(
      target.constructor
    );

    reflection.push({
      key: propertyKey.toString(),
      config: config ?? {},
    });
  };
}
