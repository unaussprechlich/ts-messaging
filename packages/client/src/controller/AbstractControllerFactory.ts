import {
  BaseClass,
  Constructor,
  Controller,
  ControllerFactory,
} from '@ts-messaging/common';

export abstract class AbstractControllerFactory
  extends BaseClass
  implements ControllerFactory
{
  abstract produce(target: Constructor): Promise<Controller>;
}
