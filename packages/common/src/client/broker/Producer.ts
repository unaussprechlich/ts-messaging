import { Connectable, Initable } from '../../interfaces';
import { UID } from '../../utils';
import { Message } from '../message';

export interface Producer extends Connectable, Initable, UID {
  produce(message: any): Promise<unknown>;
}
