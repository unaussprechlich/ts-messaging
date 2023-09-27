# Schema
The Schema is defined in TypeScript using the decorators. The decorator will attach a static meta-property to the class using reflections.

## Internal Schema Architecture

Internally the schema os represented by `RawSchema`, `Schema`, `AbstractSchema`, and their schema-specific implementations.

## :package: `@ts-messaging/common`

### `RawSchema`
The RawSchema is the most basic representation of a schema. It is a simple object with a `__type` and `schema` property and is used internally by the framework for data exchange between packages.
```ts
export interface RawSchema{
  __type: string; // "AVRO"
  schema: any;  // {type: "record", name: "User", fields: [...]}
}
```

### `SchemaObject`
The SchemaObject is a TypeScript interface that describes the decoded message type.
```ts
export interface SchemaObject {
  [key: string]: any;
}
```

### `Schema`
The schema is the common interface between all packages and the minimum type available to the developer.

Each Schema has a unique ID the `__id`, a type `__type` and the raw schema `rawSchema`. The Schema is used to `encode` and `decode` messages and `validate` the message data.
```ts
export interface Schema<T extends SchemaObject = SchemaObject> {
  readonly __type: string;
  readonly __id: string;
  
  readonly rawSchema: RawSchema;

  decode(buffer: Buffer): T | null;
  encode(data: T): Buffer;
  validate(data: T): { success: boolean };
}
```

## `SchemaFactory`
The `SchemaFactory` is used by the `Registry` to create a `Schema` from a `RawSchema`. The `SchemaFactory` is schema-specific and is implemented by each schema package.
```ts
export interface SchemaFactory<SchemaType extends string = string> {
  readonly __type: SchemaType;

  produce<T extends SchemaObject = SchemaObject>(
    config: {
      __id: number;
      rawSchema: RawSchema<SchemaType>;
    }
  ): Schema<T>;
}
```

## `SchemaEntrypoint`
The `SchemaEntrypoint` provides the a `Constructor<SchemaFactory>` to the `Registry` this constructor is invokes by the `Registry` to create a reusable `SchemaFactory` for the schema type.
```ts
export interface SchemaEntrypoint extends Entrypoint {
    readonly schemaFactory: SchemaFactory;
}
```

## :package: `@ts-messaging/schema`

### `AbstractSchema`

The AbstractSchema is the base class for all schema implementations. It implements the `Schema` interface and provides a default implementation for the `findVersion` method using a `Registry`.
```ts
import { Schema, SchemaObject, Registry } from "@ts-messaging/common";

export abstract class AbstractSchema<T extends SchemaObject = SchemaObject> implements Schema<T> {
    abstract readonly __id: number;
    abstract readonly __type: string;
    abstract readonly rawSchema: RawSchema;

    abstract decode(buffer: Buffer): T;
    abstract encode(data: T): Buffer;
    abstract validate(data: T): { success: boolean };
}
```

## :package: Example: `@ts-messaging/schema-avro`

The [@ts-messaging/schema-avro](/packages/schema-avro) package provides the `AvroSchema` implementation of the `Schema` interface.

The decoration of a `AvroObject` is left to the developer, since packages outside the scope of this package are only looking for the `__schema` meta-property, which holds a `AvroRawSchema`.

However, a good practice is to define a class decorator like `@Avro.Record()` to attach the `__schema` meta-property to the class using reflections. The fields for this record can best be specified using property decorators like `@Avro.String()`, `@Avro.Int()`, `...`.

::: details Example: @Avro.Record()


```ts
export function RecordDecoratorFactory(config: {
  name?: Name;
  namespace?: NameSpace;
  doc?: string;
  aliases?: string[];
  fields: FieldConfig[];
}){
  return function RecordDecorator<T extends AvroObject>(target: Constructor<T>) {
    // ... implementation
    Reflect.defineMetadata("__schema", rawSchema, target);
  }
}
```
:::

::: details Example: @Avro.String()
```ts
export function StringDecoratorFactory(config: {
  doc?: string;
  order?: 'ascending' | 'descending' | 'ignore';
  default?: string;
}) {
  return function StringDecorator<Target extends object>(
    target: Target,
    key: TargetMatchPropertyType<Target, string>
  ) {
      // ... implementation
  }
}

//The type can be used to match the type of the property
type TargetMatchPropertyType<T, V> = {
  [K in keyof T]-?: V extends T[K] ? K : never;
}[keyof T];

```
:::


### `AvroSchema`, `AvroRawSchema`, and `AvroObject`
```ts
import { Schema, RawSchema, Registry, SchemaObject } from '@ts-messaging/common';
import { AbstractSchema } from '@ts-messaging/schema';

export type AvroRawSchema = RawSchema<"AVRO", RecordConfig>;

export interface AvroObject extends SchemaObject {}

export class AvroSchema<T extends AvroObject = AvroObject> extends AbstractSchema<T> {
  // ... interface Schema
  readonly __type = "AVRO";
  readonly rawSchema: AvroRawSchema;
  
  constructor(registry: Registry, rawSchema: AvroRawSchema) {
    super(registry);
    this.rawSchema = rawSchema;
    // ... implementation
  }
  
  decode(buffer: Buffer): T | null {
    // ... implementation
  }
  
  encode(data: T): Buffer {
    // ... implementation
  }
  
  validate(data: T): { success: boolean } {
    // ... implementation
  }
}
```
