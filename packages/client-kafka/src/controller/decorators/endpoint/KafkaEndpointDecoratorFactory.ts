import {
  KafkaEndpointParamsReflections,
  KafkaEndpointReflections,
  KafkaEndpointReflectionType,
} from './KafkaEndpointReflections';
import { KafkaControllerEndpointsReflections } from '../controller';

export function KafkaEndpointDecoratorFactory(channelName: string) {
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
      channelName: channelName,
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
