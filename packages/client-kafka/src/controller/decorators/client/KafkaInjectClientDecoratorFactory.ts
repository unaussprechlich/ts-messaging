import { KafkaInjectClientReflections } from './KafkaInjectClientReflections';
import { TargetMatchPropertyType } from '@ts-messaging/common';
import { Kafka } from '../../../Kafka';

export function KafkaInjectClientDecoratorFactory() {
  return function decorator<T extends object>(
    target: T,
    propertyKey: TargetMatchPropertyType<T, Kafka>
  ) {
    if (KafkaInjectClientReflections.hasMetadata(target.constructor)) {
      throw new Error(
        'KafkaInjectClientDecoratorFactory: injection key already defined for this controller'
      );
    }

    KafkaInjectClientReflections.annotate(target.constructor, {
      injectClientKey: propertyKey.toString(),
    });
  };
}
