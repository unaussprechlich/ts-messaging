import { BaseClass, Consumer, Controller, Message } from '@ts-messaging/common';

export abstract class AbstractController
  extends BaseClass
  implements Controller
{
  abstract readonly name: string;
  abstract readonly consumer: Consumer;
  abstract handleMessage(message: Message): Promise<{ invocations: number }>;
}
