import { Consumer } from '../broker';
import { Message } from '../message';

export interface Controller {
  readonly consumer: Consumer;
  handleMessage(message: Message): Promise<{
    invocations: number;
  }>;
}
