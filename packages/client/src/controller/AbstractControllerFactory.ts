import {
  BaseClass,
  Constructor,
  Controller,
  ControllerFactory,
  Injectable,
} from '@ts-messaging/common';

@Injectable()
export abstract class AbstractControllerFactory
  extends BaseClass
  implements ControllerFactory
{
  abstract produce(target: Constructor): Promise<Controller>;
}
