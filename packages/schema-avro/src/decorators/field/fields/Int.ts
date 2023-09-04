import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for Int.
 */
export function IntSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<number>>
) {
  return FieldSchemaDecoratorFactory<number, AvroTypes.INT>({
    type: AvroTypes.INT,
    ...config,
  });
}
