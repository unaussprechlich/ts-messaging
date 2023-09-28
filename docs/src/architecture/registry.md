# Registry
The registry is the interface to the remote schema and contract registry. Its essential task is to cache and load contracts and schemas from the registry.

## Internal Registry Architecture

Internally the registry is represented by the `Registry` interface, the `AbstractRegistry`, and their registry-specific implementations.

## :package: `@ts-messaging/common`
Since the implementation must be adapted very specifically to the registry used in each case, the common-interface is limited only to the finding of contracts and schemas.

### `Registry`
```ts 
export interface Registry{
    findSchema<T extends SchemaObject = SchemaObject>(
        schemaId: number
    ): Promise<Schema<T> | null>;

    findContract(contractName: string): Promise<Contract | null>;
}
```

## :package: `@ts-messaging/registry`

### `AbstractRegistry`
The `AbstractRegistry` is the base class for all registry-specific implementations of the `Registry` interface. The `AbstractRegistry` is responsible for caching the contracts and schemata which have been loaded once from the registry.

```ts
export abstract class AbstractRegistry<TContract extends Contract> implements Registry {
    protected readonly schemaFactoryRegistry: SchemaFactoryRegistry;

    protected constructor(schemaProviders: SchemaEntrypoint[]) {
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
}
```
