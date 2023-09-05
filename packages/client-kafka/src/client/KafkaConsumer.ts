import { Consumer as KafkaJsConsumer } from 'kafkajs';
import { KafkaMessage } from '../KafkaMessage';
import { KafkaTopic } from '../topic';
import { Logger, LoggerChild } from '@ts-messaging/common';
import { AbstractConsumer } from '@ts-messaging/client';

export class KafkaConsumer extends AbstractConsumer {
  private topicsRegistry: Map<string, KafkaTopic> = new Map();

  protected readonly logger: Logger = LoggerChild({
    package: 'client-kafka',
    name: 'KafkaConsumer',
    uuid: this.__uid,
  });

  protected readonly consumer: KafkaJsConsumer;

  constructor(consumer: KafkaJsConsumer) {
    super();
    this.consumer = consumer;
  }

  protected async internalInit() {
    await this.consumer.run({
      eachBatchAutoResolve: false,

      eachBatch: async ({ batch, resolveOffset, commitOffsetsIfNecessary }) => {
        const topic = this.topicsRegistry.get(batch.topic);

        if (!topic) {
          const error = new Error(
            `The topic="${batch.topic}" has not been properly registered with the KafkaConsumer!`
          );
          this.logger.error(error);
          throw error;
        }

        for (const message of batch.messages) {
          this.logger.info(
            `Received message on topic="${
              batch.topic
            }", offset=${JSON.stringify(message.offset)}!`
          );
          try {
            if (!message.value) {
              this.logger.warn(
                `Received message without value on topic="${
                  batch.topic
                }", offset=${JSON.stringify(message.offset)}!`
              );
              continue;
            }

            const decoded = await topic.decodeMessageData({
              key: message.key,
              value: message.value,
            });
            const kafkaMessage = new KafkaMessage({
              topic: topic,
              schema: {
                key: decoded.key?.schema,
                value: decoded.value.schema ?? null,
              },
              data: {
                key: decoded.key?.result,
                value: decoded.value.result,
              },
              meta: message,
            });

            let invocations = 0;

            for (const controller of this.controllers) {
              try {
                const result = await controller.handleMessage(kafkaMessage);
                invocations += result.invocations;
              } catch (e: Error | unknown) {
                const resolved = await controller.handleError(
                  topic,
                  kafkaMessage,
                  e
                );
                if (!resolved) {
                  throw this.logger.proxyError(
                    new Error(
                      `Error while processing message on topic="${
                        batch.topic
                      }" with offset=${JSON.stringify(
                        message.offset
                      )} the controller could not resolve the error"! error="${e}"!`
                    )
                  );
                }
              }
            }

            if (invocations === 0) {
              throw this.logger.proxyError(
                new Error(
                  `No controller has handled the message on topic="${
                    batch.topic
                  }", offset=${JSON.stringify(message.offset)}!`
                )
              );
            }

            resolveOffset(message.offset);
            this.logger.info(
              `Resolved topic="${batch.topic}", offset="${message.offset}"!`
            );
          } catch (err) {
            this.logger.error(
              err,
              `Error while processing message on topic="${
                batch.topic
              }", message="${JSON.stringify(message)}"!`
            );
          }
        }

        await commitOffsetsIfNecessary();
      },
    });
  }

  private isConnected = false;

  async connect(): Promise<void> {
    this.isConnected = true;
    await this.consumer.connect();
    this.logger.info(`Connected to Kafka!`);
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    this.isConnected = false;
  }

  async subscribe(topics: KafkaTopic[]): Promise<void> {
    if (this.isConnected) {
      const error = new Error(
        `Cannot subscribe to topics while consumer is running!`
      );
      this.logger.error(error);
      throw error;
    }

    const topicsString = topics.map((t) => t.name);

    await this.consumer.subscribe({
      topics: topicsString,
    });
    for (const topic of topics) {
      this.topicsRegistry.set(topic.name, topic);
      this.logger.info(`Subscribed to topic="${topic.name}".`);
    }
  }
}
