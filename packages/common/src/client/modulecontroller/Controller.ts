import { Consumer } from '../Consumer';
import { Message } from '../Message';
import { Topic } from '../topic';

export interface Controller {
  readonly consumer: Consumer;
  handleMessage(message: Message): Promise<{
    invocations: number;
  }>;
  handleError(
    topic: Topic,
    message: Message,
    error: Error | unknown
  ): Promise<boolean>;
}
