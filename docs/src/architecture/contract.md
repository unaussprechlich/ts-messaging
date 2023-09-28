# Contract
Contracts are the key resource of the [Registry](/architecture/registry) and are used to register and retrieve schemas. The contract is a combination of the name of the [Channel](/architecture/channel) qualified identifiers like `{ChannelName}-key` and `{ChannelName}-value`. The key channel contains either an identifier or only metadata, while the value channel represents the actual payload of the message. Therefore, distinguishing between the key and the value schema is essential to ease schema evolution.

## Internal Contract Architecture

Internally, the contract is defined by `Contract`, `AbstractContract`, and their registry-specific implementations.

## :package: `@ts-messaging/common`

### `ContractVersion<T>`
Inside a `ContractVersion` each registered `Schema` will be assigned a unique version. The `ContractVersion` is the combination of the `Schema` and the `Contract`.

```ts 
export interface ContractVersion<T extends SchemaObject = SchemaObject> {
    contract: Contract;
    version: number;
    schema: Schema<T>;
}
```

### `Contract`
The `Contract` is the common interface between all packages and the minimum type available to the developer. The `Contract` is used to `register()` and `find()` schemas and check if a schema `isCompatible()` with the `Contract`. Since is it aware of all schemas within a Contract, the Contract is also responsible for encoding and decoding messages.

```ts
export interface Contract {
  readonly name: string;
  
  //The compatability strategy for this channel e.g. "BACKWARD", "FORWARD", "FULL", "NONE", ...
  readonly compatibilityStrategy: CompatibilityStrategy;

  isCompatible(rawSchema: RawSchema) 
    : Promise<boolean>;

  register<T extends SchemaObject>(rawSchema: RawSchema)
    : Promise<ContractVersion<T>>;
  
  findByRawSchema<T extends SchemaObject>(rawSchema: RawSchema)
    : Promise<ContractVersion<T> | null>;

  findById<T extends SchemaObject>(id: string)
    : Promise<ContractVersion<T> | null>;

  findByVersion<T extends SchemaObject>(version: string)
    : Promise<ContractVersion<T> | null>;

  findSchemaBySchemaObjectConstructor<T extends SchemaObject = SchemaObject>(
    schemaObjectConstructor: Constructor<T>,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null>;
  
  findSchemaBySchemaObject<T extends SchemaObject>(
    schemaObjectConstructor: T,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null>;
}
```


### `ContractFactory`
The `ContractFactory` is used by the `Registry` to create a `Contract` from the name of the channel. The `ContractFactory` is registry-specific and is implemented by each registry package.

```ts
export interface ContractFactory{
  produce(input : {name: string}): Promise<Contract>;
}
```

## :package: `@ts-messaging/registry`

### `AbstractContract`

The `AbstractContract` is the base class for all registry-specific implementations of the `Contract` interface. Since every version is unique to a channel, the `versionsCache` can be used to optimistically cache the schema-ID for each version.

```ts
import { Schema } from "./Schema";

export abstract class AbstractContract implements Contract {
  // ... interface Contract

  readonly versionsCache: Map<string, string> = new Map();
}
```
