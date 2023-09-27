import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for Null.
 */
export function NullSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<null>>
) {
  return FieldSchemaDecoratorFactory<null, AvroTypes.NULL>({
    type: AvroTypes.NULL,
    ...config,
  });
}
