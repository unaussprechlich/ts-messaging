import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for Long.
 */
export function LongSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<number>>
) {
  return FieldSchemaDecoratorFactory<number, AvroTypes.LONG>({
    type: AvroTypes.LONG,
    ...config,
  });
}
