import { Channel } from '../channel';
import { SchemaObject } from '../../schema';
import { ContractVersion } from '../../types';

export interface MessageMetadata {}

export interface Message<T extends SchemaObject = any> {
  readonly channel: Channel;
  payload: T | null;
  contractVersion: ContractVersion<T> | null;
  meta: MessageMetadata;
}
