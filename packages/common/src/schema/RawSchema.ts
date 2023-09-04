export interface RawSchema<SchemaType extends string = string, Raw = any> {
  __type: SchemaType;
  schema: Raw;
}
