# Message

The `Message` describes the common representation of a message inside the framework. It is used by the `Broker` to transmit messages between the producer and the consumer.

## Internal Message Architecture

Internally, the message is defined by the `Message` and `MessageData` interface and their broker-specific implementations.

## :package: `@ts-messaging/common`

### `Message`

The message interface contains the `channel`, `payload`, `contractVersion`, and `meta` properties. The `payload` is a schema object and `contractVersion` the associated version of the contract used to encode the message, and the `meta` is the broker-specific metadata.

```ts
export interface Message<T extends SchemaObject = any> {
    readonly channel: Channel;
    payload: T | null;
    contractVersion: ContractVersion<T> | null;
    meta: MessageMetadata;
}
```

### `MessageMetadata`

The `MessageMetadata` interface is a placeholder for broker-specific metadata.

```ts
export interface MessageMetadata {}
```
