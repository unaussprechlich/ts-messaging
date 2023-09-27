import {
  KafkaEndpointParamDecoratorFactory,
  KafkaEndpointParamTypes,
  KafkaParamsReflectionTypeConfig,
} from '../index';

export function KafkaEndpointParamValueDecoratorFactory(
  config?: KafkaParamsReflectionTypeConfig
): ParameterDecorator {
  return KafkaEndpointParamDecoratorFactory(
    KafkaEndpointParamTypes.VALUE,
    config
  );
}
