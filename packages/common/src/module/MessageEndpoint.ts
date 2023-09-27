import { Channel } from '../client';
import { ContractVersion } from '../types';

export interface MessageEndpoint {
  name: string;
  channel: Channel;
  payloadContractVersion: ContractVersion | null;
  endpoint: (...args: any[]) => Promise<void>;
}
