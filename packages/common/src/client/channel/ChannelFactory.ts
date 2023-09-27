import { Channel } from './ChannelInterface';

export interface ChannelFactory {
  produce(input: { name: string }): Promise<Channel>;
}
