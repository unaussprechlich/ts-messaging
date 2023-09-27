import { SchemaFactory } from './SchemaFactory';
import { Entrypoint } from '../interfaces';

export interface SchemaEntrypoint extends Entrypoint {
  readonly schemaFactory: SchemaFactory;
}
