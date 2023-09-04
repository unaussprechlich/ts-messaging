import {
  BaseClass,
  DecodeResult,
  EncodeResult,
  Injectable,
  MessageData,
  Topic,
} from '@ts-messaging/common';

@Injectable()
export abstract class AbstractTopic extends BaseClass implements Topic {
  abstract readonly name: string;

  abstract decodeMessageData(
    message: any
  ): Promise<DecodeResult | Record<string, DecodeResult>>;
  abstract encodeMessageData(
    message: any
  ): Promise<EncodeResult | Record<string, EncodeResult>>;
}
