# Endpoint

The `Endpoint` is a novel concept that is used to deliver a message to the business logic of the application. The endpoint therefore determines if a message can be committed by the consumer after it has been processed. 

## Internal Contract Architecture

### `Endpoint`

```ts
export interface MessageEndpoint<M extends Message = Message> {
    channelName: string;
    schema: Record<string, number[]> | number[];
    endpoint: (message: M) => Promise<void>;
}
```
