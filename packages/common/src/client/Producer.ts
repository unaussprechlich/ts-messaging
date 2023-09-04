import { Connectable, Initable } from '../interfaces';
import { Message } from './Message';
import { UID } from '../utils';

export interface Producer extends Connectable, Initable, UID {
  produce(message: Message, options?: any): Promise<any>;
}
