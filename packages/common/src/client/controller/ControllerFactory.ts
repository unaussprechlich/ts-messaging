import { Constructor } from '../../utils';
import { Controller } from './ControllerInterface';

export interface ControllerFactory {
  produce(controllerConstructor: Constructor): Promise<Controller>;
}
