import {
  BaseClass,
  Logger,
  LoggerChild,
  MagicByteSerializer,
  Schema,
  Contract,
  SchemaObject,
} from '@ts-messaging/common';

export abstract class Serializer extends BaseClass {
  protected readonly logger: Logger = LoggerChild({
    package: 'client',
    name: 'Serializer',
    uuid: this.__uid,
  });

  /**
   * Encodes the object according to the typename
   *
   * @param schemaObject
   * @param schemaAndVersion
   */
  encode<T extends SchemaObject>(
    schemaObject: T,
    schemaAndVersion?: Contract<T> | null
  ): Buffer {
    const schema = schemaAndVersion?.schema;

    if (!schema) {
      if (typeof schemaObject === 'object') {
        this.logger.info(
          `No schema for object="${schemaObject.constructor.name}" provided". Encoding as JSON ...`
        );
        return Buffer.from(JSON.stringify(schemaObject));
      } else {
        this.logger.info(
          `The provided object is not of type="object". Encoding as BUFFER ...`
        );
        return Buffer.from(schemaObject);
      }
    }

    const validated = schema.validate(schemaObject);

    if (!validated.success) {
      throw this.logger.proxyError(
        new Error(
          `The object=${schemaObject} is not valid for schema="${schema.__id}" and can therefore not be serialized!`
        )
      );
    }

    const encoded = MagicByteSerializer.encode(
      schema.encode(schemaObject),
      schema.__id
    );
    this.logger.info(
      `Encoded object="${schemaObject}" with schema="${schema.__id}"`
    );
    return encoded;
  }

  private primitiveDecode(input: any) {
    if (Buffer.isBuffer(input)) {
      return input.toString() as any;
    } else if (typeof input === 'string') {
      return JSON.parse(input);
    }
    return input;
  }

  /**
   * Decodes the buffer according to the typename
   *
   * @param schema
   * @param input
   */
  decode<T extends SchemaObject>(
    input: Buffer,
    schema: Schema<T> | null | undefined
  ): T {
    const magic = MagicByteSerializer.decode(input);

    if (!magic || !schema) {
      return this.primitiveDecode(input) as any;
    }

    if (magic.registryId !== -1 && magic.registryId !== schema.__id) {
      throw this.logger.proxyError(
        new Error(
          `Message encoded with registryId ${magic.registryId}, expected ${schema.__id}!`
        )
      );
    }

    const decoded = schema.decode(magic.payload);

    if (decoded === null) {
      throw this.logger.proxyError(
        new Error(
          `The payload was not properly decoded, the result="${decoded}"!`
        )
      );
    }

    const validated = schema.validate(decoded);

    if (!validated.success) {
      throw this.logger.proxyError(
        new Error(
          `The payload="${JSON.stringify(
            decoded
          )}" didn't pass the validation with schemaID="${schema.__id}"!`
        )
      );
    }

    return decoded;
  }
}
