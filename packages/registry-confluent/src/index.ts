import { RegistryEntrypoint, SchemaEntrypoint } from '@ts-messaging/common';
import { ConfluentRegistry } from './registry';
import { SchemaRegistryClientConfig } from 'ts-schemaregistry';

export * from './ConfluentError';

export class Confluent extends ConfluentRegistry implements RegistryEntrypoint {
  static readonly TYPENAME = '@ts-messaging/registry-confluent';
  static readonly INJECT_TOKEN: symbol = Symbol(Confluent.TYPENAME);

  readonly TYPENAME = Confluent.TYPENAME;
  readonly INJECT_TOKEN = Confluent.INJECT_TOKEN;

  constructor(config: {
    schemaProviders: SchemaEntrypoint[];
    clientConfig: SchemaRegistryClientConfig;
    autoRegisterSchemas?: boolean;
  }) {
    super(config);
  }
}
