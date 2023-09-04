import {
  KafkaEndpointParamDecoratorFactory,
  KafkaEndpointParamTypes,
  KafkaParamsReflectionTypeConfig,
} from '../index';

export function KafkaEndpointParamMetadataDecoratorFactory(
  config?: Omit<KafkaParamsReflectionTypeConfig, 'autoRegister'>
): ParameterDecorator {
  return KafkaEndpointParamDecoratorFactory(
    KafkaEndpointParamTypes.METADATA,
    config
  );
}
