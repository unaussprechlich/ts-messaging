import {
  FieldSchemaDecoratorConfig,
  FieldSchemaDecoratorFactory,
} from '../FieldSchemaDecoratorFactory';
import { OmitType } from '../../../utils';
import { AvroTypes } from '../../../types';

/**
 * Decorator for String.
 */
export function StringSchemaDecoratorFactory(
  config?: OmitType<FieldSchemaDecoratorConfig<string>>
) {
  return FieldSchemaDecoratorFactory<string, AvroTypes.STRING>({
    type: AvroTypes.STRING,
    ...config,
  });
}
