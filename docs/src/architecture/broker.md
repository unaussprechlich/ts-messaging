# Broker

The `Broker` is the interface to the underlying message broker. It is responsible for the transmission of messages between the producer and the consumer.

## Internal Broker Architecture

Internally, the broker is defined by the `Broker`, `Producer`, and `Consumer` adapters and their broker-specific implementations.

## :package: `@ts-messaging/common`

### `Broker`

The broker interface is defined by the `createProducer` and `createConsumer` methods. The `createProducer` method is used to create a `Producer` instance and the `createConsumer` method is used to create a `Consumer` instance and automatically register them with the broker.

```ts
export interface Broker extends Connectable{
    createProducer(config: unknown): Producer;
    createConsumer(config: unknown): Consumer;

    findChannel(name: string): Promise<Channel | null>;
}
```

### `Producer`

The sole responsibility of the `Producer` is to transmit messages to the broker. The `Producer` is created by the `Broker` and is automatically registered with the remote broker.

```ts
export interface Producer extends Connectable {
    produce(message: any): Promise<unknown>;
}
```

### `Consumer`

On this highest level, the only responsibility of the `Consumer` is to subscribe to channels. The `Consumer` is created by the `Broker` and is automatically registered with the remote broker.

```ts
export interface Consumer extends Connectable {
    subscribe(channels: Channel[]): Promise<void>;
}
```

## :package: `@ts-messaging/client`

### `AbstractBroker`

The `Broker` interface is extended by a caching mechanism. The `AbstractBroker` is responsible for caching the `Channel` instances.

```ts
export abstract class AbstractBroker<TChannel extends Channel> implements Broker {
    
    protected readonly channels = new Cache<string, TChannel>((key: string) =>
        this.loadChannel(key)
    );

    protected abstract loadChannel(topicName: string): Promise<TChannel | null>;

    async findChannel(name: string): Promise<TChannel | null> {
        return this.channelCache.find(name);
    }

    abstract createConsumer(config: unknown): Consumer;
    abstract createProducer(config: unknown): Producer;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
}
```

### `AbstractConsumer`

The `AbstractConsumer` is responsible for the transmission of messages to the `Controller` instances. They are registered within the `AbstractConsumer` and are called when a message is received. The implementation is highly broker-specific.

```ts
export abstract class AbstractConsumer implements Consumer {
    protected readonly controllers: Controller[] = [];

    registerController(controller: Controller): void {
        this.controllers.push(controller);
    }

    abstract subscribe(channels: Channel[]): Promise<void>;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>
}
```

