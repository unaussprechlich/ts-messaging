import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for Float.
 */
export function FloatSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<number>>
) {
  return FieldSchemaDecoratorFactory<number, AvroTypes.FLOAT>({
    type: AvroTypes.FLOAT,
    ...config,
  });
}
