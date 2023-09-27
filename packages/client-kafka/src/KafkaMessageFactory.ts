import { KafkaBroker } from './broker';
import { IHeaders } from 'kafkajs';
import { KafkaMessage } from './KafkaMessage';

export class KafkaMessageFactory {
  constructor(protected readonly broker: KafkaBroker) {}

  async produce(input: {
    channel: string;
    payload: any;
    key?: any;
    partition?: number;
    headers?: IHeaders;
    timestamp?: string;
  }): Promise<KafkaMessage> {
    const meta = {
      partition: input.partition,
      headers: input.headers,
      timestamp: input.timestamp,
    };

    const channel = await this.broker.loadChannel(input.channel);

    const contract = await channel.findContract();
    const contractVersion = await contract?.findSchemaBySchemaObject(
      input.payload
    );

    if (!input.key) {
      return new KafkaMessage({
        channel: channel,
        payload: input.payload,
        contractVersion: contractVersion ?? null,
        meta,
      });
    }

    const keyContract = await channel.findKeyContract();
    const keyContractVersion = await keyContract?.findSchemaBySchemaObject(
      input.key
    );

    return new KafkaMessage({
      channel: channel,
      payload: input.payload,
      contractVersion: contractVersion ?? null,
      key: input.key,
      keyContractVersion: keyContractVersion ?? undefined,
      meta,
    });
  }
}
