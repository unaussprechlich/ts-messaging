import { Topic } from './TopicInterface';

export interface TopicFactory {
  produce(input: { name: string }): Promise<Topic>;
}
