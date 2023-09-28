[![DOI](https://zenodo.org/badge/686961126.svg)](https://zenodo.org/badge/latestdoi/686961126)
<p align="center"><img alt="Logo" width="200px" height="200px" src="https://raw.githubusercontent.com/unaussprechlich/ts-messaging/dev/docs/src/public/logo.png"></p>


# ts-messaging (Status: Research Prototype)

An opinionated framework for type consistency in message stacks with a focus on developer experience.

The documentation can be found [here](https://unaussprechlich.github.io/ts-messaging).

## Minimal Example
Create a connection with the Confluent Schema Registry and Avro as a schema provider.
```typescript
import { Confluent } from '@ts-messaging/registry-confluent';

const confluentSchemaRegistry = new Confluent({
    clientConfig: {
        baseUrl: 'http://localhost:8081',
    },
    schemaProviders: [new Avro()],
    autoRegisterSchemas: true,
})
````

Create a Avro Schema with decorators.
```typescript
import { Avro } from '@ts-messaging/schema-avro';

@Avro.Record({
    name: 'sampleRecord',
    namespace: 'com.mycorp.mynamespace',
    doc: 'Sample schema to help you get started.',
})
export class TestValue {
    @Avro.Int({
        doc: 'The int type is a 32-bit signed integer.',
    })
    my_field1: number;

    //If the schema is used in a endpoint all constructor arguments must be optional.
    constructor(my_field1?: number) {
        this.my_field1 = my_field1;
    }
}
```

Setup a Kafka Client and import the `TestController`
````typescript
const client = new Kafka({
    broker: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'minimal-kafka-example' },
    autoRegisterTopics: true,
    registry: confluentSchemaRegistry,
    controllers: [TestController],
});
````

```typescript
@Kafka.Controller()
class TestController {
    
    @Kafka.Endpoint('test')
    async onMessage(
        @Kafka.Key() key: {id: string },
        @Kafka.Value() value: TestValue,
        @Kafka.Metadata() meta: KafkaMetadata
    ) {
        console.log('[MyEndpoint] Message offset=' + meta.offset);
    }
}
```
Send a message to the topic.
```typescript
await client.produce({
    topic: 'test',
    data: {
        key: { id: '::1' },
        value: new TestValue('Hello World!'),
    },
});
```



## Setup
- Install [pnpm](https://pnpm.io/)
- Run `pnpm install`
- Run `pnpm build::all`
- Run `pnpm install` again to resolve local dependencies

## Appendix: Install Confluent Platform
- Install [Docker Desktop](https://www.docker.com/get-started/) and enable Kubernetes
- Install [Helm](https://helm.sh/docs/intro/install/)

```bash
#Create the namespace to use.
kubectl create namespace confluent

#Set this namespace to default for your Kubernetes context.
kubectl config set-context --current --namespace confluent

#Add the Confluent for Kubernetes Helm repository.
helm repo add confluentinc https://packages.confluent.io/helm
helm repo update

#Install Confluent for Kubernetes.
helm upgrade --install confluent-operator confluentinc/confluent-for-kubernetes

#Install all Confluent Platform components.
kubectl apply -f https://raw.githubusercontent.com/confluentinc/confluent-kubernetes-examples/master/quickstart-deploy/confluent-platform-singlenode.yaml

#Install a sample producer app and topic.
kubectl apply -f https://raw.githubusercontent.com/confluentinc/confluent-kubernetes-examples/master/quickstart-deploy/producer-app-data-singlenode.yaml

#Check that everything is deployed:
kubectl get pods
```

#### Expose with port forwarding:
```bash
#Set up port forwarding to Control Center web UI from local machine to localhost:9021
kubectl port-forward controlcenter-0 9021:9021
```

#### To deliver Kafka and the schema registry with a load balancer on localhost, apply the following files:
- **Kafka** on `localhost:8081` with `/.kubernetes/service-kafka-localhost.yml`
- **Schema Registry** on `localhost:9092` with `/.kubernetes/service-schemaregistry-localhost.yml`
