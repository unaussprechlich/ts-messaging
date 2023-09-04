import {
  KafkaEndpointParamsReflections,
  KafkaEndpointReflections,
  KafkaEndpointReflectionType,
} from './KafkaEndpointReflections';
import { KafkaControllerEndpointsReflections } from '../controller';

export function KafkaEndpointDecoratorFactory(topicName: string) {
  return function decorator<Target extends object>(
    target: Target,
    key: any,
    descriptor: PropertyDescriptor
  ) {
    const params = KafkaEndpointParamsReflections.useSafeReflectWithDefault(
      target,
      {
        targetKey: key,
      }
    );

    const endpoint: KafkaEndpointReflectionType = {
      topicName: topicName,
      params: params,
    };

    KafkaEndpointReflections.annotate(target, endpoint, {
      targetKey: key,
    });

    KafkaControllerEndpointsReflections.useSafeReflectWithDefault(
      target.constructor
    ).push(endpoint);
  };
}
