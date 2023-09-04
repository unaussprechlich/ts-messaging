import { RawSchema } from './RawSchema';
import { ReflectionHelper } from '../utils';

export const SchemaReflectionHelper = new ReflectionHelper<RawSchema>(
  '__schema::RawSchema'
);

export const SchemaTypeReflectionHelper = new ReflectionHelper<string>(
  '__schema::type'
);
