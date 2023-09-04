export interface PropertyDecoratorFactory {
  decoratorFactory(config: any): PropertyDecorator;
}

export interface ClassDecoratorFactory {
  decoratorFactory(config: any): ClassDecorator;
}
