import { ContractVersion } from '../types';
import { Constructor, UID } from '../utils';
import { RawSchema, SchemaObject } from '../schema';

export enum CompatabilityStrategy {
  BACKWARD = 'BACKWARD',
  BACKWARD_TRANSITIVE = 'BACKWARD_TRANSITIVE',
  FORWARD = 'FORWARD',
  FORWARD_TRANSITIVE = 'FORWARD_TRANSITIVE',
  FULL = 'FULL',
  FULL_TRANSITIVE = 'FULL_TRANSITIVE',
  NONE = 'NONE',
}

export interface Contract extends UID {
  /**
   * The name of the subject.
   */
  readonly name: string;

  readonly compatabilityStrategy: CompatabilityStrategy;

  tagSchemaObject<T extends SchemaObject = SchemaObject>(
    schemaObject: T,
    version: ContractVersion<T>
  ): void;

  /**
   * Check if a raw schema is compatible with the subject
   * @param rawSchema
   */
  isCompatible(rawSchema: RawSchema): Promise<boolean>;

  /**
   * Register a new schema for this subject
   * @param rawSchema
   */
  register<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema
  ): Promise<ContractVersion<T>>;

  /**
   * Find a schema by raw schema
   * @param rawSchema
   * @param options
   */
  findByRawSchema<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null>;

  /**
   * Find a schema by version
   * @param version
   */
  findByVersion<T extends SchemaObject = SchemaObject>(
    version: number
  ): Promise<ContractVersion<T> | null>;

  /**
   * Find a schema by id
   * @param schemaID
   */
  findById<T extends SchemaObject = SchemaObject>(
    schemaID: number
  ): Promise<ContractVersion<T> | null>;

  /**
   * Find a schema by schema object constructor
   * @param schemaObjectConstructor
   * @param options
   */
  findSchemaBySchemaObjectConstructor<T extends SchemaObject = SchemaObject>(
    schemaObjectConstructor: Constructor<T>,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null>;

  /**
   * Find a schema by schema object
   * @param schemaObjectConstructor
   * @param options
   */
  findSchemaBySchemaObject<T extends SchemaObject = SchemaObject>(
    schemaObjectConstructor: T,
    options?: { autoRegister?: boolean }
  ): Promise<ContractVersion<T> | null>;
}
