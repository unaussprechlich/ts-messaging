import {
  BaseClass,
  Consumer,
  Controller,
  Injectable,
  Message,
  Topic,
} from '@ts-messaging/common';

@Injectable()
export abstract class AbstractController
  extends BaseClass
  implements Controller
{
  abstract readonly name: string;
  abstract readonly consumer: Consumer;
  abstract handleError(
    topic: Topic,
    message: Message,
    error: Error | unknown
  ): Promise<boolean>;
  abstract handleMessage(message: Message): Promise<{ invocations: number }>;
}
