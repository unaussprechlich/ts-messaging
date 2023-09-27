import { Consumer } from './Consumer';

export interface ConsumerFactory {
  createConsumer(config: unknown): Consumer;
}
