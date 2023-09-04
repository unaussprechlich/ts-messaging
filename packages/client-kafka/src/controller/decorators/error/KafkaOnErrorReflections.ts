import { ReflectionHelper } from '@ts-messaging/common';

export const KafkaOnErrorReflections = new ReflectionHelper<{
  handler: string;
}>('@ts-messaging/client-kafka::OnError');
