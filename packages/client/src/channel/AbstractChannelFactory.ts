import { Channel, ChannelFactory } from '@ts-messaging/common';

export abstract class AbstractChannelFactory implements ChannelFactory {
  abstract produce(input: { name: string }): Promise<Channel>;
}
