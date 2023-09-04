import { ProducerFactory } from './ProducerFactory';
import { ConsumerFactory } from './ConsumerFactory';
import { Producer } from './Producer';
import { Consumer } from './Consumer';
import { Connectable, Initable } from '../interfaces';
import { UID } from '../utils';
import { Topic } from './topic';

export interface Client
  extends ProducerFactory,
    ConsumerFactory,
    Connectable,
    Initable,
    UID {
  readonly producer: Producer;
  readonly consumer: Consumer;

  createProducer(config: any): Producer;
  createConsumer(config: any): Consumer;

  produce(message: any): Promise<any>;
  findTopic(topicName: string): Promise<Topic | null>;
  findTopicWithError(topicName: string): Promise<Topic>;
}
