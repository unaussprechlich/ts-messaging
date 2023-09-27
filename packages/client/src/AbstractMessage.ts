import {
  Message,
  MessageMetadata,
  Channel,
  SchemaObject,
  ContractVersion,
} from '@ts-messaging/common';

export abstract class AbstractMessage<T extends SchemaObject = any>
  implements Message<T>
{
  abstract readonly payload: T | null;
  abstract readonly contractVersion: ContractVersion<T> | null;
  abstract readonly meta: MessageMetadata;
  abstract readonly channel: Channel;
}
