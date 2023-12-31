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

  findContract(contractName: string): Promise<Contract | null>;
  findContractWithError(contractName: string): Promise<Contract>;
}
