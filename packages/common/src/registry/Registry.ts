import { Initable } from '../interfaces';
import { Contract } from './Contract';
import { Schema, SchemaObject } from '../schema';
import { UID } from '../utils';

export interface Registry extends Initable, UID {
  findSchema<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T> | null>;
  findSchemaWithError<T extends SchemaObject = SchemaObject>(
    schemaId: number
  ): Promise<Schema<T>>;

  findContract(subjectName: string): Promise<Contract | null>;
  findContractWithError(subjectName: string): Promise<Contract>;
}
