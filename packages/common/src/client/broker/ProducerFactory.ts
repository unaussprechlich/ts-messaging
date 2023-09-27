import { Producer } from './Producer';

export interface ProducerFactory {
  createProducer(config: unknown): Producer;
}
