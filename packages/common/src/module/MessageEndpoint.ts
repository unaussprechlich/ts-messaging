import { Message } from '../client';

export interface MessageEndpoint<M extends Message = Message> {
  topicName: string;
  schema: Record<string, number[]> | number[];
  endpoint: (message: M) => Promise<void>;
}
