# Registry
The registry is the interface to the schema registry. Its essential task is to find subjects as well as schemas in it, or to create them if necessary.

## :package: `@ts-messaging/registry`
Since the implementation must be adapted very specifically to the registry used in each case, the common-interface is limited only to the finding of subjects and schemas.

### `Registry`
```ts 
export interface Registry{
  findSchema<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T> | null>;

  findSubject(subjectName: string)
    : Promise<Subject | null>;
}
```
