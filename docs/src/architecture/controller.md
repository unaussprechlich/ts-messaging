# Controller

The `Controller` is highly broker-specific. It is serves as a mediator and controller between endpoints and consumers. 

## Internal Controller Architecture

Internally the controller is represented by `Controller`, `XXX`, `XXX`, and their broker-specific implementations.

## :package: `@ts-messaging/common`

### `Controller`

Internally, the controller is defined by the `Controller` interface. It contains a reference to its consumer and a `handleMessage` method that is invoked by the consumer when a message is received.

```ts 
export interface Controller {
    readonly consumer: Consumer;
    handleMessage(message: Message): Promise<{
        invocations: number;
    }>;
}
```

### `ControllerFactory`
The `ControllerFactory` is used by the `Client` to create a `Controller` from an annotated class. The `ControllerFactory` is broker-specific and is implemented by each client package.

```ts
export interface ControllerFactory {
    produce(controllerConstructor: Constructor): Promise<Controller>;
}
```
