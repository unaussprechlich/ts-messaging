# Endpoint

The `Endpoint` is a novel concept that is used to deliver a message to the business logic of the application. The endpoint therefore determines if a message can be committed by the consumer after it has been processed. As its implementation is highly broker-dependent, the `endpoint is only implemented in the client package.

## Internal Endpoint Architecture

Internally, the endpoint is defined by the `Endpoint` interface and their broker-specific implementations.

## :package: `@ts-messaging/common`

### `Endpoint`

```ts
export interface MessageEndpoint {
    name: string;
    channel: Channel;
    payloadContractVersion: ContractVersion | null;
    endpoint: (...args: any[]) => Promise<void>;
}
```
