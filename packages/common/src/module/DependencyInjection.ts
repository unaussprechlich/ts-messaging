export {
  injectable as Injectable,
  inject as Inject,
  Container as ContainerDI,
  interfaces as InversifyInterfaces,
} from 'inversify';

export const INJECTABLES = {
  client: Symbol.for('Client'),
  registry: Symbol.for('Registry'),
  subjectFactory: Symbol.for('SubjectFactory'),
  topicFactory: Symbol.for('TopicFactory'),
  controllerFactory: Symbol.for('ControllerFactory'),
  schemaFactories: Symbol.for('SchemaFactories'),
  consumerFactory: Symbol.for('ConsumerFactory'),
  producerFactory: Symbol.for('ProducerFactory'),
  defaultConsumer: Symbol.for('DefaultConsumer'),
  defaultProducer: Symbol.for('DefaultProducer'),
} as const;
