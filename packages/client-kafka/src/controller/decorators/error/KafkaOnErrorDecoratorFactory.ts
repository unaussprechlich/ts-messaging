import { KafkaOnErrorReflections } from './KafkaOnErrorReflections';

export function KafkaOnErrorDecoratorFactory(): MethodDecorator {
  return function decorator(
    target: object,
    propertyKey: string | symbol,
    propertyDescriptor: PropertyDescriptor
  ) {
    if (KafkaOnErrorReflections.hasMetadata(target.constructor)) {
      throw new Error(
        'KafkaOnErrorDecoratorFactory: the error handler has already been defined for this controller'
      );
    }

    KafkaOnErrorReflections.annotate(
      target,
      {
        handler: propertyKey as string,
      },
      {
        targetKey: propertyKey as string | symbol,
      }
    );
  };
}
