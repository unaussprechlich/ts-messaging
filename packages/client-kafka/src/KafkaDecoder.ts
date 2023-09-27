import {
  BaseClass,
  Contract,
  ContractVersion,
  Logger,
  LoggerChild,
  MagicByteSerializer,
  SchemaObject,
} from '@ts-messaging/common';
import { KafkaMessage } from './KafkaMessage';
import { KafkaMessage as KafkaJsMessage } from 'kafkajs';
import { KafkaChannel } from './channel';

export class KafkaDecoder extends BaseClass {
  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaDecoder',
    uuid: this.__uid,
  });

  async decode(channel: KafkaChannel, message: KafkaJsMessage) {
    const payload = await this.findContractVersionAndDecode(
      await channel.findContract(),
      message.value
    );

    const key = message.key
      ? await this.findContractVersionAndDecode(
          await channel.findKeyContract(),
          message.key
        )
      : undefined;

    return new KafkaMessage({
      channel: channel,
      meta: message,
      payload: payload?.decoded ?? null,
      contractVersion: payload?.contractVersion ?? null,
      key: key?.decoded,
      keyContractVersion: key?.contractVersion,
    });
  }

  protected async findContractVersionAndDecode(
    contract: Contract | null,
    buffer: Buffer | null
  ): Promise<{
    decoded: SchemaObject;
    contractVersion?: ContractVersion;
  } | null> {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return {
        decoded: buffer as any,
      };
    }

    if (!contract) {
      this.logger.info(
        `The buffer="${buffer.toString()}" has no associated contract. Decoding as SON ...`
      );

      return this.decodeJson(buffer);
    }

    const magic = MagicByteSerializer.decode(buffer);

    if (!magic) {
      this.logger.info(
        `The buffer="${buffer.toString()}" has not been encoded with a magic byte. Decoding as JSON ...`
      );
      return this.decodeJson(buffer);
    }

    const contractVersion = await contract.findById(magic.registryId);

    if (!contractVersion) {
      throw this.logger.proxyError(
        new Error(
          `The buffer="${buffer.toString()}"has been encoded with a magic byte but the schema is not registered.`
        )
      );
    }

    const decoded = contractVersion.schema.decode(magic.payload);

    contract.tagSchemaObject(decoded, contractVersion);

    return {
      decoded,
      contractVersion,
    };
  }

  private decodeJson(buffer: Buffer) {
    const bufferString = buffer.toString();

    try {
      return {
        decoded: JSON.parse(bufferString),
      };
    } catch (error) {
      this.logger.debug(`Failed to parse JSON: ${bufferString}`);
    }

    return {
      decoded: bufferString,
    };
  }
}
