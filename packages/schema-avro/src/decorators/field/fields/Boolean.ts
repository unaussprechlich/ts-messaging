import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for Boolean.
 */
export function BooleanSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<boolean>>
) {
  return FieldSchemaDecoratorFactory<boolean, AvroTypes.BOOLEAN>({
    type: AvroTypes.BOOLEAN,
    ...config,
  });
}
