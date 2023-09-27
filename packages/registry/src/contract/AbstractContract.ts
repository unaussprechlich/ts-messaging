import {
  SchemaObject,
  RawSchema,
  Contract,
  ContractVersion,
  BaseClass,
  Constructor,
  ReflectionHelper,
  Registry,
  SchemaReflectionHelper,
  CompatabilityStrategy,
} from '@ts-messaging/common';

export abstract class AbstractContract extends BaseClass implements Contract {
  readonly name: string;
  readonly compatabilityStrategy: CompatabilityStrategy;

  protected abstract readonly registry: Registry;

  protected contractReflectionHelper: ReflectionHelper<{
    __id: number;
    version: number;
  }>;

  protected constructor(
    name: string,
    compatabilityStrategy: CompatabilityStrategy
  ) {
    super();
    this.name = name;
    this.contractReflectionHelper = new ReflectionHelper(
      `__contract::${this.name}(${this.__uid})`
    );
    this.compatabilityStrategy = compatabilityStrategy;
  }

  tagSchemaObject<T extends SchemaObject = SchemaObject>(
    schemaObject: T,
    contractVersion: ContractVersion<T>
  ) {
    this.tagSchemaObjectConstructor(
      schemaObject.constructor as Constructor<T>,
      contractVersion
    );
  }

  tagSchemaObjectConstructor<T extends SchemaObject = SchemaObject>(
    schemaObjectConstructor: Constructor<T>,
    contractVersion: ContractVersion<T>
  ) {
    if (!this.contractReflectionHelper.hasMetadata(schemaObjectConstructor)) {
      this.contractReflectionHelper.annotate(schemaObjectConstructor, {
        __id: contractVersion.schema.__id,
        version: contractVersion.version,
      });
    }
  }

  /**
   * Find a schema by schema object constructor
   * @param schemaObjectConstructor
   * @param options
   */
  async findSchemaBySchemaObjectConstructor<
    T extends SchemaObject = SchemaObject
  >(
    schemaObjectConstructor: Constructor<T>,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null> {
    const reflectedSchemaId = this.contractReflectionHelper.useReflect(
      schemaObjectConstructor
    );

    if (reflectedSchemaId) {
      return this.findByVersion<T>(reflectedSchemaId.version);
    }

    const rawSchema = SchemaReflectionHelper.useReflect(
      schemaObjectConstructor
    );

    if (!rawSchema) {
      return null;
    }

    const contractVersion = await this.findByRawSchema<T>(rawSchema, options);

    if (!contractVersion) {
      return null;
    }

    this.tagSchemaObjectConstructor(schemaObjectConstructor, contractVersion);

    return contractVersion;
  }

  /**
   * Find a schema by schema object
   * @param schemaObject
   * @param options
   */
  findSchemaBySchemaObject<T extends SchemaObject = SchemaObject>(
    schemaObject: T,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null> {
    return this.findSchemaBySchemaObjectConstructor(
      schemaObject.constructor as Constructor<T>,
      options
    );
  }

  /**
   * Find a schema by version
   * @param version
   */
  abstract findByVersion<T extends SchemaObject = SchemaObject>(
    version: number
  ): Promise<ContractVersion<T> | null>;

  /**
   * Check if a raw schema is compatible with the contract
   * @param rawSchema
   */
  abstract isCompatible(rawSchema: RawSchema): Promise<boolean>;

  /**
   * Register a new schema for this contract
   * @param rawSchema
   */
  abstract register<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema
  ): Promise<ContractVersion<T>>;

  /**
   * Find a schema by raw schema
   * @param rawSchema
   * @param options
   */
  abstract findByRawSchema<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null>;

  /**
   * Find a schema by id
   * @param schemaID
   */
  abstract findById<T extends SchemaObject = SchemaObject>(
    schemaID: number
  ): Promise<ContractVersion<T> | null>;
}
