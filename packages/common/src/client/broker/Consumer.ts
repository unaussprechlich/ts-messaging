import { Connectable, Initable } from '../../interfaces';
import { UID } from '../../utils';
import { Channel } from '../channel';

export interface Consumer extends Connectable, Initable, UID {
  subscribe(channels: Channel[]): Promise<void>;
}
