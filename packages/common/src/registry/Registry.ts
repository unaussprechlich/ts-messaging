import { Initable } from '../interfaces';
import { Subject } from './subject';
import { Schema, SchemaObject } from '../schema';
import { UID } from '../utils';

export interface Registry extends Initable, UID {
  findSchema<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T> | null>;
  findSchemaWithError<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T>>;

  findSubject(subjectName: string): Promise<Subject | null>;
  findSubjectWithError(subjectName: string): Promise<Subject>;
}
