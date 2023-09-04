import { SchemaFactory } from './SchemaFactory';
import { Constructor } from '../utils';
import { Entrypoint } from '../interfaces';

export interface SchemaEntrypoint extends Entrypoint {
  readonly SchemaFactoryConstructor: Constructor<SchemaFactory>;
}
