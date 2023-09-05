import {
  SchemaObject,
  RawSchema,
  Subject,
  Contract,
  BaseClass,
  Constructor,
  ReflectionHelper,
  Registry,
  SchemaReflectionHelper,
  MagicByteSerializer,
  Schema,
  CompatabilityStrategy,
  SchemaTypeReflectionHelper,
} from '@ts-messaging/common';

export abstract class AbstractSubject extends BaseClass implements Subject {
  abstract readonly name: string;
  abstract readonly compatabilityStrategy: CompatabilityStrategy;

  protected abstract readonly registry: Registry;

  async decode<T extends SchemaObject = SchemaObject>(
    buffer: Buffer
  ): Promise<{
    result: T;
    schema?: Schema<T>;
    version?: number;
  }> {
    const magic = MagicByteSerializer.decode(buffer);

    if (!magic) {
      this.logger.info(
        `The buffer="${buffer.toString()}" has not been encoded with a magic byte. Decoding as JSON ...`
      );
      return {
        result: JSON.parse(buffer.toString()) as any,
      };
    }

    const schemaAndVersion = await this.findById<T>(magic.registryId);

    if (!schemaAndVersion) {
      throw this.logger.proxyError(
        new Error(
          `The buffer="${buffer.toString()}"has been encoded with a magic byte but the schema is not registered.`
        )
      );
    }

    const decoded = schemaAndVersion.schema.decode(magic.payload);

    const reflectionHelper = new ReflectionHelper<{
      __id: number;
      version: number;
    }>(`__schema::Registry(${this.registry.__uid})::Subject(${this.__uid})`);

    SchemaReflectionHelper.annotate(decoded, schemaAndVersion.schema.rawSchema);
    SchemaTypeReflectionHelper.annotate(
      decoded,
      schemaAndVersion.schema.__type
    );
    reflectionHelper.annotate(decoded, {
      __id: schemaAndVersion.schema.__id,
      version: schemaAndVersion.version,
    });

    this.logger.info(
      `Decoded object="${decoded.constructor.name}" for subject="${this.name}" with version="${schemaAndVersion.version}" and schema="${schemaAndVersion.schema.__id}".`
    );

    return {
      result: decoded,
      ...schemaAndVersion,
    };
  }

  async encode<T extends SchemaObject = SchemaObject>(
    schemaObject: T
  ): Promise<{
    result: Buffer;
    schema?: Schema<T>;
    version?: number;
  }> {
    const schemaAndVersion = await this.findSchemaBySchemaObject(schemaObject);

    if (!schemaAndVersion) {
      this.logger.info(
        `The object="${schemaObject.constructor.name}" has no schema. Encoding as JSON ...`
      );
      return {
        result: Buffer.from(JSON.stringify(schemaObject)),
      };
    }

    const validated = schemaAndVersion.schema.validate(schemaObject);

    if (!validated.success) {
      throw this.logger.proxyError(
        new Error(
          `The object=${schemaObject} is not valid for schema="${
            schemaAndVersion.schema.__id
          }" and can therefore not be serialized! validationResult"${JSON.stringify(
            validated
          )}`
        )
      );
    }

    const encoded = MagicByteSerializer.encode(
      schemaAndVersion.schema.encode(schemaObject),
      schemaAndVersion.schema.__id
    );

    this.logger.info(
      `Encoded object="${schemaObject}" for subject="${this.name}" with version="${schemaAndVersion.version}" and schema="${schemaAndVersion.schema.__id}".`
    );

    return {
      result: encoded,
      ...schemaAndVersion,
    };
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
  ): Promise<Contract<T> | null> {
    const reflectionHelper = new ReflectionHelper<{
      __id: number;
      version: number;
    }>(`__schema::Registry(${this.registry.__uid})::Subject(${this.__uid})`);

    const reflectedSchemaId = reflectionHelper.useReflect(
      schemaObjectConstructor
    );

    if (reflectedSchemaId) {
      return this.findByVersion<T>(reflectedSchemaId.version);
    }

    const rawSchema = SchemaReflectionHelper.useSafeReflectWithError(
      schemaObjectConstructor
    );

    const contract = await this.findByRawSchema<T>(rawSchema, options);

    if (!contract) {
      return null;
    }

    reflectionHelper.annotate(schemaObjectConstructor, {
      __id: contract.schema.__id,
      version: contract.version,
    });

    return contract;
  }

  /**
   * Find a schema by schema object
   * @param schemaObject
   * @param options
   */
  findSchemaBySchemaObject<T extends SchemaObject = SchemaObject>(
    schemaObject: T,
    options?: { autoRegister?: boolean }
  ): Promise<Contract<T> | null> {
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
  ): Promise<Contract<T> | null>;

  /**
   * Check if a raw schema is compatible with the subject
   * @param rawSchema
   */
  abstract isCompatible(rawSchema: RawSchema): Promise<boolean>;

  /**
   * Register a new schema for this subject
   * @param rawSchema
   */
  abstract register<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema
  ): Promise<Contract<T>>;

  /**
   * Find a schema by raw schema
   * @param rawSchema
   * @param options
   */
  abstract findByRawSchema<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema,
    options?: { autoRegister?: boolean }
  ): Promise<Contract<T> | null>;

  /**
   * Find a schema by id
   * @param schemaID
   */
  abstract findById<T extends SchemaObject = SchemaObject>(
    schemaID: number
  ): Promise<Contract<T> | null>;
}
