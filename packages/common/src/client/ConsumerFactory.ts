import { Consumer } from './Consumer';

export interface ConsumerFactory {
  createConsumer(config: any): Consumer;
}
