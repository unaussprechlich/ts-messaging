import { DecodeResult, EncodeResult } from '../../registry';

export interface Topic {
  readonly name: string;

  encodeMessageData(
    message: any
  ): Promise<EncodeResult | Record<string, EncodeResult>>;
  decodeMessageData(
    message: any
  ): Promise<DecodeResult | Record<string, DecodeResult>>;
}
