import {
  KafkaEndpointParamDecoratorFactory,
  KafkaEndpointParamTypes,
  KafkaParamsReflectionTypeConfig,
} from '../index';

export function KafkaEndpointParamKeyDecoratorFactory(
  config?: KafkaParamsReflectionTypeConfig
): ParameterDecorator {
  return KafkaEndpointParamDecoratorFactory(
    KafkaEndpointParamTypes.KEY,
    config
  );
}
