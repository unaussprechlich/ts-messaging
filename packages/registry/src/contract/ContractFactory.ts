import { Contract } from '@ts-messaging/common';

export interface ContractFactory {
  produce(input: { name: string }): Promise<Contract>;
}
