import { Constructor, SchemaReflectionHelper } from '@ts-messaging/common';
import { AvroTypes, RecordConfig } from '../../types';
import {
  AvroRecordFieldsReflections,
  AvroRecordReflections,
} from './AvroRecordReflections';
import { Avro } from '../../Avro';
import { util } from 'zod';
import MakePartial = util.MakePartial;

export function RecordSchemaDecoratorFactory(
  config?: MakePartial<Omit<RecordConfig, 'fields' | 'type'>, 'name'>
) {
  return function decorator<T extends Constructor<object>>(target: T) {
    const schema: RecordConfig = {
      type: AvroTypes.RECORD,
      fields: AvroRecordFieldsReflections.useSafeReflectWithDefault(target),
      name: config?.name ?? target.name,
      ...config,
    };

    AvroRecordReflections.annotate(target, schema);

    SchemaReflectionHelper.annotate(target, {
      __type: Avro.TYPENAME,
      schema: schema,
    });
  };
}
