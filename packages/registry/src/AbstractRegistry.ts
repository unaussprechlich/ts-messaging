import {
  Registry,
  Schema,
  Contract,
  SchemaObject,
  BaseClass,
  SchemaFactoryRegistry,
  SchemaEntrypoint,
  Cache,
} from '@ts-messaging/common';

export abstract class AbstractRegistry<TContract extends Contract>
  extends BaseClass
  implements Registry
{
  protected readonly schemaFactoryRegistry: SchemaFactoryRegistry;

  protected constructor(schemaProviders: SchemaEntrypoint[]) {
    super();
    this.schemaFactoryRegistry = new SchemaFactoryRegistry(schemaProviders);
  }

  /**
   * Contract Cache
   * @protected
   */
  protected readonly contractCache = new Cache<string, TContract>(
    (key: string) => this.loadContract(key)
  );
  protected abstract loadContract(name: string): Promise<TContract | null>;

  async findContract(contractName: string): Promise<TContract | null> {
    return this.contractCache.find(contractName);
  }

  async findContractWithError(contractName: string): Promise<TContract> {
    const contract = await this.findContract(contractName);

    if (!contract) {
      throw this.logger.proxyError(
        new Error(`Contract with name ${contractName} not found.`)
      );
    }

    return contract;
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
