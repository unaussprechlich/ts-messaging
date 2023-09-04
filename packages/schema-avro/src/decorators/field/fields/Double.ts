import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for Double.
 */
export function DoubleSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<number>>
) {
  return FieldSchemaDecoratorFactory<number, AvroTypes.DOUBLE>({
    type: AvroTypes.DOUBLE,
    ...config,
  });
}
