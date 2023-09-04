import { FieldConfig } from './FieldConfig';

export type RecordConfig<
  Name extends string = string,
  NameSpace extends string | undefined = string | undefined
> = {
  type: 'record';
  name: Name;
  namespace?: NameSpace;
  doc?: string;
  aliases?: string[];
  fields: FieldConfig[];
};
