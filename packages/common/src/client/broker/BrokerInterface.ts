import { ProducerFactory } from './ProducerFactory';
import { ConsumerFactory } from './ConsumerFactory';
import { Producer } from './Producer';
import { Consumer } from './Consumer';
import { Connectable, Initable } from '../../interfaces';
import { UID } from '../../utils';
import { Channel } from '../channel';

export interface Broker
  extends ProducerFactory,
    ConsumerFactory,
    Connectable,
    Initable,
    UID {
  createProducer(config: unknown): Producer;
  createConsumer(config: unknown): Consumer;

  findChannel(name: string): Promise<Channel | null>;
  findChannelWithError(name: string): Promise<Channel>;
}
