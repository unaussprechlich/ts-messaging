import {
  Message,
  MessageData,
  MessageMetadata,
  MessageSchema,
  Topic,
} from '@ts-messaging/common';

export abstract class AbstractMessage implements Message {
  abstract readonly data: MessageData;
  abstract readonly meta: MessageMetadata;
  abstract readonly schema: MessageSchema | null;
  abstract readonly topic: Topic;
}
