import { AbstractSubject } from '@ts-messaging/registry';
import {
  Logger,
  LoggerChild,
  RawSchema,
  Contract,
  SchemaObject,
  CompatabilityStrategy,
} from '@ts-messaging/common';
import { ConfluentRegistry } from '../registry';
import {
  SchemaRegistryClientInferRequest,
  SchemaRegistryTypes,
} from 'ts-schemaregistry';
import { ConfluentError } from '../ConfluentError';

export class ConfluentSubject extends AbstractSubject {
  protected readonly registry: ConfluentRegistry;

  protected readonly logger: Logger = LoggerChild({
    package: 'registry-confluent',
    name: 'ConfluentSubject',
    uuid: this.__uid,
  });

  protected readonly versions = new Map<number, number>();

  constructor(
    name: string,
    compatabilityStrategy: CompatabilityStrategy,
    registry: ConfluentRegistry
  ) {
    super(name, compatabilityStrategy);
    this.registry = registry;
  }

  /**
   * Check if a schema is compatible with this subject
   * @param rawSchema
   */
  async isCompatible(rawSchema: RawSchema): Promise<boolean> {
    const request = {
      params: { subject: this.name },
      body: {
        schema: JSON.stringify(rawSchema.schema),
        schemaType: SchemaRegistryTypes.SchemaType.parse(rawSchema.__type),
      },
    };

    const response =
      await this.registry.api.client.compatability.subjects.subject.versions.post(
        request
      );

    if (response.status === 200) {
      this.logger.info(
        `Schema with type="${rawSchema.__type}" compatible="${response.body.is_compatible}" with subject ${this.name}.`
      );
      this.logger.debug(
        `Schema with type="${rawSchema.__type}" compatible="${response.body.is_compatible}" with subject ${this.name}.`,
        JSON.stringify(rawSchema.schema)
      );
      return response.body.is_compatible;
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.registry.api.contract.compatability.subjects.subject.versions.post,
          request,
          response
        )
      );
    }
  }

  /**
   * Register a new schema for this subject
   * @param rawSchema
   */
  async register<T extends SchemaObject = SchemaObject>(rawSchema: RawSchema) {
    const request: SchemaRegistryClientInferRequest<
      typeof this.registry.api.contract.subjects.subject.versions.post
    > = {
      params: { subject: this.name },
      query: {},
      body: {
        schema: JSON.stringify(rawSchema.schema),
        schemaType: SchemaRegistryTypes.SchemaType.parse(rawSchema.__type),
      },
    };

    const response =
      await this.registry.api.client.subjects.subject.versions.post(request);

    if (response.status === 200) {
      const schemaAndVersion = await this.findById<T>(response.body.id);

      if (!schemaAndVersion) {
        throw this.logger.proxyError(
          new Error(
            `Could not find the newly registered schema with id=${response.body.id} in subject with name="${this.name}"`
          )
        );
      }

      this.logger.info(
        `Successfully registered new schema for subject ${this.name} with id=${response.body.id}`
      );

      return schemaAndVersion;
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.registry.api.contract.subjects.subject.versions.post,
          request,
          response
        )
      );
    }
  }

  /**
   * Find a schema by raw schema
   * @param rawSchema
   * @param options
   */
  async findByRawSchema<T extends SchemaObject = SchemaObject>(
    rawSchema: RawSchema,
    options?: { autoRegister?: boolean }
  ): Promise<Contract<T> | null> {
    const request = {
      params: { subject: this.name },
      body: {
        schema: JSON.stringify(rawSchema.schema),
        schemaType: SchemaRegistryTypes.SchemaType.parse(rawSchema.__type),
      },
    };

    const response = await this.registry.api.client.subjects.subject.post(
      request
    );

    if (response.status === 200) {
      const schema = await this.registry.findSchemaWithError<T>(
        response.body.id
      );

      const version = response.body.version;

      this.versions.set(version, schema.__id);

      this.logger.info(
        `Loaded schema with id="${schema.__id}" and version="${version}" for subject with name="${this.name}" by raw schema.`
      );

      return {
        version: version,
        schema: schema,
        subject: this,
      };
    } else if (response.status === 404) {
      if (options?.autoRegister || this.registry.autoRegisterSchemas) {
        this.logger.info(
          `Could not find schemaID for subject with name="${this.name}", trying auto register...`
        );
        return this.register(rawSchema);
      }
      this.logger.warn(
        `Could not find schemaID for subject with name="${
          this.name
        }" by rawSchema="${JSON.stringify(rawSchema)}".`
      );
      return null;
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.registry.api.contract.subjects.subject.post,
          request,
          response
        )
      );
    }
  }

  /**
   * Find a schema by version
   * @param version
   */
  async findByVersion<T extends SchemaObject = SchemaObject>(
    version: number
  ): Promise<Contract<T> | null> {
    const cached = this.versions.get(version);

    if (cached) {
      return {
        subject: this,
        schema: await this.registry.findSchemaWithError<T>(cached),
        version,
      };
    }

    const request: SchemaRegistryClientInferRequest<
      typeof this.registry.api.contract.subjects.subject.versions.version.get
    > = {
      params: { subject: this.name, version: version },
    };

    const response =
      await this.registry.api.client.subjects.subject.versions.version.get(
        request
      );

    if (response.status === 200) {
      if (response.body.version !== version) {
        throw this.logger.proxyError(
          new Error(
            `Version mismatch expected=${version} got=${response.body.version}`
          )
        );
      }

      const schema = await this.registry.findSchemaWithError<T>(
        response.body.id
      );

      this.logger.info(
        `Loaded schema with id="${schema.__id}" and version="${version}" for subject with name="${this.name}".`
      );

      this.versions.set(version, schema.__id);

      return {
        subject: this,
        version: version,
        schema: schema,
      };
    } else if (response.status === 404) {
      this.logger.info(
        `Could not find schema for subject name="${this.name}" with version="${version}"`
      );
      return null;
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.registry.api.contract.subjects.subject.versions.version.get,
          request,
          response
        )
      );
    }
  }

  /**
   * Find a schema by id
   * @param schemaID
   */
  async findById<T extends SchemaObject = SchemaObject>(
    schemaID: number
  ): Promise<Contract<T> | null> {
    const cachedVersion =
      Array.from(this.versions.entries()).find(([_, value]) => {
        return value && value === schemaID;
      })?.[0] ?? null;

    const schema = await this.registry.findSchemaWithError<T>(schemaID);

    if (cachedVersion) {
      return {
        subject: this,
        schema,
        version: cachedVersion,
      };
    }

    const request: SchemaRegistryClientInferRequest<
      typeof this.registry.api.contract.schemas.ids.id.versions.get
    > = {
      params: { id: schemaID },
    };

    const response = await this.registry.api.client.schemas.ids.id.versions.get(
      request
    );

    if (response.status === 200) {
      this.logger.debug(
        `Found ${response.body.length} subjects for schema with id="${schemaID}"`
      );
      const version =
        response.body.find((it) => it.subject === this.name)?.version ?? null;

      if (!version) {
        return null;
      }

      this.versions.set(version, schema.__id);
      return {
        subject: this,
        schema,
        version,
      };
    } else if (response.status === 404) {
      this.logger.debug(
        `Could not find schema with id="${schemaID}" in the registry`
      );
      return null;
    } else {
      throw this.logger.proxyError(
        new ConfluentError(
          this.registry.api.contract.schemas.ids.id.versions.get,
          request,
          response
        )
      );
    }
  }
}
