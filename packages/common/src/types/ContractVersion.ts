import { Schema, SchemaObject } from '../schema';
import { Contract } from '../registry';

export interface ContractVersion<T extends SchemaObject = SchemaObject> {
  contract: Contract;
  version: number;
  schema: Schema<T>;
}
