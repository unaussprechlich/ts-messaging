# Subject
Subjects are the key resource of the [Registry](/architecture/registry) and are used to register and retrieve schemas. The subject is a combination of the name of the [Topic](/architecture/topic) qualified identifiers `{TopicName}-key` and `{TopicName}-value`. The key subject contains either an identifier or only metadata, while the value subject represents the actual payload of the message. Therefore, distinguishing between the key and the value schema is essential to ease schema evolution.

## Internal Subject Architecture

Internally, the subject is defined by `Subject`, `AbstractSubject`, and their registry-specific implementations.

## :package: `@ts-messaging/common`

### `Contract<T>`
Inside a `Subject` each registered `Schema` will be assigned a unique version. The `Contract` is the combination of the `Schema` and the `Subject`.

```ts 
export interface Contract<T extends SchemaObject = SchemaObject>{
  version: string;
  schema: Schema<T>;
  subject: string
};
```

### `Subject`
The `Subject` is the common interface between all packages and the minimum type available to the developer. The `Subject` is used to `register()` and `find()` schemas and check if a schema `isCompatible()` with the `Subject`. Since is it aware of all schemas within a Subject, the Subject is also responsible for encoding and decoding messages.

```ts
export interface Subject {
  readonly name: string;
  
  //The compatability strategy for this subject e.g. "BACKWARD", "FORWARD", "FULL", "NONE", ...
  readonly compatibilityStrategy: CompatibilityStrategy;

  isCompatible(rawSchema: RawSchema) 
    : Promise<boolean>;

  register<T extends SchemaObject>(rawSchema: RawSchema)
    : Promise<Contract<T>>;
  
  findByRawSchema<T extends SchemaObject>(rawSchema: RawSchema)
    : Promise<Contract<T> | null>;

  findById<T extends SchemaObject>(id: string)
    : Promise<Contract<T> | null>;

  findByVersion<T extends SchemaObject>(version: string)
    : Promise<Contract<T> | null>;

  findSchemaBySchemaObjectConstructor<T extends SchemaObject = SchemaObject>(
    schemaObjectConstructor: Constructor<T>,
    options?: { autoRegister?: boolean }
  ): Promise<Contract<T> | null>;
  
  findSchemaBySchemaObject<T extends SchemaObject>(
    schemaObjectConstructor: T,
    options?: { autoRegister?: boolean }
  ): Promise<Contract<T> | null>;

  decode<T extends SchemaObject>(buffer: Buffer)
    : Promise<DecodeResult<T>>;

  encode<T extends SchemaObject = any>(schemaObject: T)
    : Promise<EncodeResult<T>>;
}
```


### `SubjectFactory`
The `SubjectFactory` is used by the `Registry` to create a `Subject` from the name of the subject. The `SubjectFactory` is registry-specific and is implemented by each registry package.

```ts
export interface SubjectFactory{
  produce(subjectName: string): Promise<Subject>;
}
```

## :package: `@ts-messaging/registry`

### `AbstractSubject`

The `AbstractSubject` is the base class for all registry-specific implementations of the `Subject` interface. Since every version is unique to a subject, the `versionsCache` can be used to optimistically cache the schema-ID for each version.

```ts
import { Schema } from "./Schema";

export abstract class AbstractSubject implements Subject {
  // ... interface Subject

  readonly versionsCache: Map<string, string> = new Map();
}
```
