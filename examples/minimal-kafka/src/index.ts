import {
  Kafka,
  KafkaMessage,
  KafkaMetadata,
  KafkaTopic,
} from '@ts-messaging/client-kafka';
import { Avro } from '@ts-messaging/schema-avro';
import { Confluent } from '@ts-messaging/registry-confluent';

@Avro.Record({
  name: 'sampleRecord',
  namespace: 'com.mycorp.mynamespace',
  doc: 'Sample schema to help you get started.',
})
export class TestKey {
  @Avro.Int({
    doc: 'The int type is a 32-bit signed integer.',
  })
  my_field1: number;

  constructor(my_field1: number) {
    this.my_field1 = my_field1;
  }
}

/**
 * Avro: Value schema
 */
@Avro.Record({
  name: 'value',
})
export class TestValue {
  @Avro.String()
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

@Kafka.Controller()
class TestController {
  //Inject the client into the controller
  @Kafka.InjectClient()
  kafka: Kafka;

  //Define a message endpoint
  @Kafka.Endpoint('test-topic')
  async onMessage(
    @Kafka.Key({
      autoRegister: true,
    })
    key: TestKey,
    @Kafka.Value({
      autoRegister: true,
    })
    value: TestValue,
    @Kafka.Metadata() meta: KafkaMetadata
  ) {
    if (Math.random() > 0.5) {
      throw new Error('Random error!');
    }
    console.log('[MyEndpoint] Message offset=' + meta.offset);
  }

  //Intercept errors
  @Kafka.OnError()
  async onError(
    topic: KafkaTopic,
    message: KafkaMessage,
    error: Error | unknown
  ) {
    console.log('[MyEndpoint] Error=' + error);

    return true;
  }
}

const client = new Kafka({
  broker: { brokers: ['localhost:9092'] },
  consumer: { groupId: 'test' },
  registry: new Confluent({
    clientConfig: {
      baseUrl: 'http://localhost:8081',
    },
    schemaProviders: [new Avro()],
  }),
  controllers: [TestController],
});

async function sendSomething() {
  await client.produce({
    topic: 'test-topic',
    data: {
      key: new TestKey(1),
      value: new TestValue('Hello World!'),
    },
  });
}

async function main() {
  await client.init();
  setInterval((args) => {
    sendSomething().catch(console.error);
  }, 20000);
}

main().catch(console.error);
