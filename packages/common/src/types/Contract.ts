import { Schema, SchemaObject } from '../schema';
import { Subject } from '../registry';

export interface Contract<T extends SchemaObject = SchemaObject> {
  version: number;
  subject: Subject;
  schema: Schema<T>;
}
