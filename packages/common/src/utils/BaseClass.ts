import { UID } from './NanoId';
import { nanoid } from 'nanoid';
import { Logger } from '../Logger';

export abstract class BaseClass implements UID {
  readonly __uid = nanoid(5);
  protected abstract readonly logger: Logger;
}
