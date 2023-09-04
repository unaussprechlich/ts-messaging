import { Connectable, Initable } from '../interfaces';

import { UID } from '../utils';
import { Topic } from './topic';

export interface Consumer extends Connectable, Initable, UID {
  subscribe(topics: Topic[]): Promise<void>;
}
