import { AvroTypes, FieldConfig, RecordConfig } from './types';
import { AvroRawSchema } from './AvroRawSchema';
import { z, ZodType } from 'zod';
import { Injectable, SchemaObject } from "@ts-messaging/common";

const AvroZodTypes = {
  [AvroTypes.STRING]: () => z.string(),
  //[AvroTypes.ARRAY]: () => z.array(z.any()),
  [AvroTypes.BOOLEAN]: () => z.boolean(),
  //[AvroTypes.BYTES]: () => z.???(),
  [AvroTypes.DOUBLE]: () => z.number(),
  [AvroTypes.FLOAT]: () => z.number(),
  [AvroTypes.INT]: () => z.number().int(),
  [AvroTypes.LONG]: () => z.number(),
  [AvroTypes.NULL]: () => z.null(),
  //[AvroTypes.ENUM]: () => z.enum(['']),
  //[AvroTypes.FIXED]: () => z.string(),
  //[AvroTypes.MAP]: () => z.record(z.any()),
  //[AvroTypes.UNION]: () => z.any(),
} satisfies Record<
  Exclude<AvroTypes, AvroTypes.RECORD>,
  (input: any) => ZodType
>;

@Injectable()
export class AvroZodTypeFactory {
  produce<T extends SchemaObject = SchemaObject>(rawSchema: AvroRawSchema) {
    if (rawSchema.schema.type === AvroTypes.RECORD) {
      return this.zodRecordFactory<T>(rawSchema.schema as RecordConfig);
    } else {
      throw new Error('Only record type supported');
    }
  }

  protected zodRecordFactory<T extends SchemaObject = SchemaObject>(
    config: RecordConfig,
  ) {
    if (!config.fields)
      throw new Error(
        'No fields defined in record config' + JSON.stringify(config),
      );

    return z.object(
      Object.fromEntries(
        config.fields.map((field) => {
          return [field.name, this.zodFieldsFactory(field)];
        }),
      ),
    ) as unknown as ZodType<T>;
  }

  protected zodFieldsFactory(config: FieldConfig) {
    if (config.type === AvroTypes.RECORD) {
      throw new Error('Record type not supported in field config');
    }

    const zodType = AvroZodTypes[config.type]();

    return config.default
      ? zodType.optional()
      : zodType;
  }
}
