export enum AvroTypes {
  NULL = 'null',
  BOOLEAN = 'boolean',
  INT = 'int',
  LONG = 'long',
  FLOAT = 'float',
  DOUBLE = 'double',
  //BYTES = 'bytes',
  STRING = 'string',
  RECORD = 'record',
  //ENUM = 'enum',
  //ARRAY = 'array',
  //MAP = 'map',
  //UNION = 'union',
  //FIXED = 'fixed',
}

export type FieldConfig<
  DefaultType = any,
  TypeName extends AvroTypes = AvroTypes
> = {
  name: string;
  type: TypeName;
  doc?: string;
  order?: 'ascending' | 'descending' | 'ignore';
  default?: DefaultType;
};
