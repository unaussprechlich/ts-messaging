import { Controller } from './Controller';
import { Constructor } from '../../utils';

export interface ControllerFactory {
  produce(controllerConstructor: Constructor): Promise<Controller>;
}
