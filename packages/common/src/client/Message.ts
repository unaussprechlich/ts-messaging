import { Topic } from './topic';

export interface MessageData {}

export interface MessageSchema {}

export interface MessageMetadata {}

export interface Message {
  readonly topic: Topic;
  data: MessageData;
  meta: MessageMetadata;
  schema: MessageSchema | null;
}
