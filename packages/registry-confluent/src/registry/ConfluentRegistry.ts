import {
  SchemaRegistryApi,
  SchemaRegistryClientConfig,
  SchemaRegistryClientInferRequest,
} from 'ts-schemaregistry';
import { AbstractRegistry } from '@ts-messaging/registry';
import {
  Logger,
  LoggerChild,
  Schema,
  SchemaEntrypoint,
} from '@ts-messaging/common';
import { ConfluentError } from '../ConfluentError';
import { ConfluentContract, ConfluentContractFactory } from '../contract';

export class ConfluentRegistry extends AbstractRegistry<ConfluentContract> {
  protected logger: Logger = LoggerChild({
    package: 'registry-confluent',
    name: 'ConfluentRegistry',
    uuid: this.__uid,
  });

  readonly api: SchemaRegistryApi;
  autoRegisterSchemas: boolean;

  protected readonly contractFactory: ConfluentContractFactory;

  protected constructor(config: {
    schemaProviders: SchemaEntrypoint[];
    clientConfig: SchemaRegistryClientConfig;
    autoRegisterSchemas?: boolean;
  }) {
    super(config.schemaProviders);
    this.api = new SchemaRegistryApi(config.clientConfig);
    this.contractFactory = new ConfluentContractFactory(this);
    this.autoRegisterSchemas = config.autoRegisterSchemas ?? false;
  }

  protected async internalInit(): Promise<void> {
    return;
  }

  protected async loadSchema(schemaId: number): Promise<Schema | null> {
    const request = {
      params: { id: schemaId },
    };

    const response = await this.api.client.schemas.ids.id.get(request);

    if (response.status === 200) {
      this.logger.info(`Loaded schema with id="${schemaId}" from the registry`);

      return this.schemaFactoryRegistry.produce({
        __id: schemaId,
        rawSchema: {
          __type: response.body.schemaType ?? 'AVRO',
          schema: JSON.parse(response.body.schema),
        },
      });
    } else if (response.status === 404) {
      this.logger.info(
        `Could not find schema with id="${schemaId}" in the registry`
      );
      return null;
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.api.contract.schemas.ids.id.get,
          request,
          response
        )
      );
    }
  }

  protected async loadContract(
    contractName: string
  ): Promise<ConfluentContract | null> {
    const request: SchemaRegistryClientInferRequest<
      typeof this.api.contract.subjects.get
    > = {
      query: { subjectPrefix: contractName },
    } as const;

    const response = await this.api.client.subjects.get(request);

    if (response.status === 200) {
      const has =
        response.body.length > 0 && response.body.includes(contractName);

      if (!has) {
        this.logger.info(
          `The registry does not have contract with name="${contractName}" in the registry. Creating (locally) ...`
        );
        return this.contractFactory.produce({
          name: contractName,
        });
      }

      this.logger.info(
        `The registry has="${has}" the contract="${contractName}" in the registry.`
      );

      return this.contractFactory.produce({
        name: contractName,
      });
    } else if (response.status === 404) {
      this.logger.info(
        `The registry does not have contract with the prefix="${contractName}" in the registry. Creating (locally) ...`
      );
      return this.contractFactory.produce({
        name: contractName,
      });
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.api.contract.schemas.ids.id.get,
          request,
          response
        )
      );
    }
  }
}
