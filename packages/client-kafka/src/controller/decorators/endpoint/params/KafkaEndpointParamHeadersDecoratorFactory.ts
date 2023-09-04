import {
  KafkaEndpointParamDecoratorFactory,
  KafkaEndpointParamTypes,
  KafkaParamsReflectionTypeConfig,
} from '../index';

export function KafkaEndpointParamHeadersDecoratorFactory(
  config?: Omit<KafkaParamsReflectionTypeConfig, 'autoRegister'>
): ParameterDecorator {
  return KafkaEndpointParamDecoratorFactory(
    KafkaEndpointParamTypes.HEADERS,
    config
  );
}
