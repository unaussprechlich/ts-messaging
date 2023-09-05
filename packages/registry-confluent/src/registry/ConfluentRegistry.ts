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
import { ConfluentSubject, ConfluentSubjectFactory } from '../subject';
import { ConfluentError } from '../ConfluentError';

export class ConfluentRegistry extends AbstractRegistry<ConfluentSubject> {
  protected logger: Logger = LoggerChild({
    package: 'registry-confluent',
    name: 'ConfluentRegistry',
    uuid: this.__uid,
  });

  readonly api: SchemaRegistryApi;
  autoRegisterSchemas: boolean;

  protected readonly subjectFactory: ConfluentSubjectFactory;

  protected constructor(config: {
    schemaProviders: SchemaEntrypoint[];
    clientConfig: SchemaRegistryClientConfig;
    autoRegisterSchemas?: boolean;
  }) {
    super(config.schemaProviders);
    this.api = new SchemaRegistryApi(config.clientConfig);
    this.subjectFactory = new ConfluentSubjectFactory(this);
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

  protected async loadSubject(
    subjectName: string
  ): Promise<ConfluentSubject | null> {
    const request: SchemaRegistryClientInferRequest<
      typeof this.api.contract.subjects.get
    > = {
      query: { subjectPrefix: subjectName },
    } as const;

    const response = await this.api.client.subjects.get(request);

    if (response.status === 200) {
      const has =
        response.body.length > 0 && response.body.includes(subjectName);

      if (!has) {
        this.logger.info(
          `The registry does not have subject with name="${subjectName}" in the registry. Creating (locally) ...`
        );
        return this.subjectFactory.produce({
          name: subjectName,
        });
      }

      this.logger.info(
        `The registry has="${has}" the subject="${subjectName}" in the registry.`
      );

      return this.subjectFactory.produce({
        name: subjectName,
      });
    } else if (response.status === 404) {
      this.logger.info(
        `The registry does not have subjects with the prefix="${subjectName}" in the registry. Creating (locally) ...`
      );
      return this.subjectFactory.produce({
        name: subjectName,
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
