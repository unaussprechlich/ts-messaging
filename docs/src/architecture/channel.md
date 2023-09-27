# Channel

The `Channel` is a resource of the `Broker`. It is a message transmission path. Each channel holds its associated contract and can use them to encode and decode the entire messages.

## Internal Topic Architecture

## :package: `@ts-messaging/common`

### `Channel`
```ts
export interface Channel {
  readonly name: string;

}
```
