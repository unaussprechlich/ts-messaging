import {
  Registry,
  Schema,
  Subject,
  SchemaObject,
  BaseClass,
  SchemaFactoryRegistry,
  SchemaEntrypoint,
  Cache,
} from '@ts-messaging/common';

export abstract class AbstractRegistry<TSubject extends Subject>
  extends BaseClass
  implements Registry
{
  protected readonly schemaFactoryRegistry: SchemaFactoryRegistry;

  protected constructor(schemaProviders: SchemaEntrypoint[]) {
    super();
    this.schemaFactoryRegistry = new SchemaFactoryRegistry(schemaProviders);
  }

  /**
   * Subject Cache
   * @protected
   */
  protected readonly subjectCache = new Cache<string, TSubject>((key: string) =>
    this.loadSubject(key)
  );
  protected abstract loadSubject(subjectName: string): Promise<TSubject | null>;

  async findSubject(subjectName: string): Promise<TSubject | null> {
    return this.subjectCache.find(subjectName);
  }

  async findSubjectWithError(subjectName: string): Promise<TSubject> {
    const subject = await this.findSubject(subjectName);

    if (!subject) {
      throw this.logger.proxyError(
        new Error(`Subject with name ${subjectName} not found.`)
      );
    }

    return subject;
  }

  /**
   * Schema Cache
   * @protected
   */
  protected readonly schemaCache = new Cache<number, Schema>((key: number) =>
    this.loadSchema(key)
  );
  protected abstract loadSchema(schemaId: number): Promise<Schema | null>;

  async findSchema<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T> | null> {
    return (await this.schemaCache.find(schemaId)) as Schema<T> | null;
  }

  async findSchemaWithError<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T>> {
    const schema = await this.findSchema<T>(schemaId);

    if (!schema) {
      throw this.logger.proxyError(
        new Error(`Schema with id ${schemaId} not found.`)
      );
    }

    return schema;
  }

  /**
   * Internal Initialization
   * @protected
   */
  protected initPromise: Promise<void> | undefined;
  protected abstract internalInit(): Promise<void>;

  async init() {
    if (!this.initPromise) {
      this.initPromise = this.internalInit();
    }

    return this.initPromise;
  }
}
