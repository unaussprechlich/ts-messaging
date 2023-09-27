import {
  RawSchema,
  Schema,
  SchemaEntrypoint,
  SchemaFactory,
  SchemaObject,
} from '../schema';

export class SchemaFactoryRegistry {
  protected schemaFactories: Map<string, SchemaFactory> = new Map();

  constructor(schemaProviders: SchemaEntrypoint[]) {
    for (const schemaProvider of schemaProviders) {
      this.registerSchemaFactory(schemaProvider.schemaFactory);
    }
  }

  /**
   * Register a schema factory for a specific schema type
   * @param factory
   */
  registerSchemaFactory<SchemaType extends string = string>(
    factory: SchemaFactory<SchemaType>
  ) {
    this.schemaFactories.set(factory.__type, factory);
  }

  /**
   * Produce a schema from a raw schema
   * @param config
   */
  async produce<T extends SchemaObject = SchemaObject>(config: {
    __id: number;
    rawSchema: RawSchema;
  }): Promise<Schema<T>> {
    const factory = this.schemaFactories.get(config.rawSchema.__type);
    if (!factory)
      throw new Error(
        `No factory found for schema type ${config.rawSchema.__type}`
      );

    return factory.produce<T>(config);
  }
}
