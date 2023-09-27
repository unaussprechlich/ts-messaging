import { Confluent } from '@ts-messaging/registry-confluent';
import { Avro, AvroObject } from '@ts-messaging/schema-avro';
import {
  Kafka,
  KafkaChannel,
  KafkaController,
  KafkaMessage,
  KafkaMessageMetadata,
} from '@ts-messaging/client-kafka';

//1. Initialization of the registry adapter and schema adapter
const confluentSchemaRegistry = new Confluent({
  clientConfig: {
    baseUrl: 'http://localhost:8081',
  },
  schemaProviders: [new Avro()],
  autoRegisterSchemas: true,
});

//2. Definition of a SchemaObject

@Avro.Record({
  name: 'sampleRecord',
  namespace: 'com.mycorp.mynamespace',
  doc: 'Sample schema to help you get started.',
})
export class SampleRecord implements AvroObject {
  @Avro.Int({
    doc: 'The int type is a 32-bit signed integer.',
  })
  my_field1: number | undefined;

  //If the schema is used in a endpoint all constructor arguments must be optional.
  constructor(my_field1?: number) {
    this.my_field1 = my_field1;
  }
}

@Kafka.Controller({ consumer: { groupId: 'minimal-example' } })
class MinimalController implements KafkaController {
  @Kafka.Endpoint('minimal.example')
  async onMessage(
    @Kafka.Key() key: { id: string },
    @Kafka.Payload() payload: SampleRecord,
    @Kafka.Metadata() meta: KafkaMessageMetadata
  ) {
    console.log('[MyEndpoint] Message offset=' + meta.offset);
  }
}

const client = new Kafka({
  broker: { brokers: ['localhost:9092'] },
  registry: confluentSchemaRegistry,
  controllers: [MinimalController],
  autoRegisterChannels: true,
});

const producer = client.broker.createProducer({});

async function sendSomething() {
  await producer.produce({
    channel: 'minimal.example',
    payload: new SampleRecord(123),
    key: { id: '::1' },
  });
}

async function main() {
  await client.init();
  await client.connect();
  setInterval((args) => {
    sendSomething().catch(console.error);
  }, 20000);
}

main().catch(console.error);
