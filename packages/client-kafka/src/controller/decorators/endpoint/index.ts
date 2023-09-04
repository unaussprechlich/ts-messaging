import { ReflectionHelper } from '@ts-messaging/common';
import {
  KafkaEndpointParamsReflections,
  KafkaParamsReflectionTypeConfig,
} from './KafkaEndpointReflections';

export * from './KafkaEndpointDecoratorFactory';
export * from './KafkaEndpointReflections';

export * from './params';

export enum KafkaEndpointParamTypes {
  KEY = 'key',
  VALUE = 'value',
  METADATA = 'metadata',
  HEADERS = 'headers',
}

export function KafkaEndpointParamDecoratorFactory(
  paramType: KafkaEndpointParamTypes,
  config?: KafkaParamsReflectionTypeConfig
): ParameterDecorator {
  return function decorator(target, propertyKey, parameterIndex) {
    const designType = ReflectionHelper.getDesignParamTypes(
      target,
      propertyKey
    )[parameterIndex];

    if (!designType && !config?.type) {
      throw new Error(
        `No design type found for parameter ${parameterIndex} of ${
          target.constructor.name
        }.${propertyKey?.toString()}. If you are compiling to JavaScript make sure your environment supports decorator-metadata. You can also pass a type to the decorator directly.`
      );
    }

    if (config?.type && designType && config.type.name !== designType.name) {
      throw new Error(
        `The type ${config.type.name} does not match the design type ${designType.name}`
      );
    }

    (KafkaEndpointParamsReflections.useSafeReflectWithDefault(target, {
      targetKey: propertyKey,
    })[paramType] as any) = {
      type: paramType,
      parameterIndex: parameterIndex,
      designType: designType ?? config?.type,
      config: config,
    };
  };
}
