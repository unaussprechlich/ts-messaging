import { Constructor, ReflectionHelper } from '@ts-messaging/common';
import { KafkaEndpointParamTypes } from './index';

export type KafkaEndpointReflectionType = {
  topicName: string;
  params: KafkaEndpointSupportedParamsType;
};

export const KafkaEndpointReflections =
  new ReflectionHelper<KafkaEndpointReflectionType>(
    '@ts-messaging/client-kafka::KafkaEndpointReflections'
  );

export type KafkaParamsReflectionTypeConfig = {
  type?: Constructor;
  autoRegister?: boolean;
};

export type KafkaParamsReflectionType<
  T extends KafkaEndpointParamTypes = KafkaEndpointParamTypes
> = {
  type: T;
  parameterIndex: number;
  designType: Constructor;
  config?: KafkaParamsReflectionTypeConfig;
};

export type KafkaEndpointSupportedParamsType = {
  [K in KafkaEndpointParamTypes]?: KafkaParamsReflectionType<K>;
};

export const KafkaEndpointParamsReflections =
  new ReflectionHelper<KafkaEndpointSupportedParamsType>(
    '@ts-messaging/client-kafka::KafkaEndpointReflections.params',
    () => {
      return {};
    }
  );
