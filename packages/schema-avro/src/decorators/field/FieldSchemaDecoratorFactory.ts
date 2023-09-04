import { OptionalKeys, TargetMatchPropertyType } from '@ts-messaging/common';
import { AvroTypes, FieldConfig } from '../../types';
import { AvroFieldReflections } from './AvroFieldReflections';
import { AvroRecordFieldsReflections } from '../record';

export type FieldSchemaDecoratorConfig<
  T,
  TypeName extends AvroTypes = AvroTypes
> = OptionalKeys<FieldConfig<T, TypeName>, 'name'>;

export function FieldSchemaDecoratorFactory<
  T,
  TypeName extends AvroTypes = AvroTypes
>(config: FieldSchemaDecoratorConfig<T, TypeName>) {
  return function decorator<Target extends object>(
    target: Target,
    key: TargetMatchPropertyType<Target, T>
  ) {
    const fieldConfig = {
      name: key as string,
      ...config,
    };

    AvroFieldReflections.annotate(target, fieldConfig, {
      targetKey: key as string,
    });

    AvroRecordFieldsReflections.useSafeReflectWithDefault(
      target.constructor
    ).push(fieldConfig);
  };
}
