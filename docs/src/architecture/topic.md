# Topic

The `Topic` is a resource of the `Client`. It is a collection of subjects. Each topic holds its associated subjects and can use them to encode and decode the entire messages.

## Internal Topic Architecture

## :package: `@ts-messaging/common`

### `Topic`
```ts
export interface Topic {
  readonly name: string;

  encodeMessageData(
    message: any
  ): Promise<EncodeResult | Record<string, EncodeResult>>;
  decodeMessageData(
    message: any
  ): Promise<DecodeResult | Record<string, DecodeResult>>;
}
```
