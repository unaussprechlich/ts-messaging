import { Contract } from '../../registry';

export interface Channel {
  readonly name: string;

  findContract(): Promise<Contract | null>;

  /*encodeMessageData(
    message: any
  ): Promise<EncodeResult | Record<string, EncodeResult>>;
  decodeMessageData(
    message: any
  ): Promise<DecodeResult | Record<string, DecodeResult>>;*/
}
