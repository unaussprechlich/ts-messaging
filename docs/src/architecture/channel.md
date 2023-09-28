# Channel

The `Channel` is a resource of the `Broker`. It is a message transmission path. Each channel can determine its associated contract.

## Internal Channel Architecture

Internally, the channel is defined by `Channel`, `AbstractChannel`, and their registry-specific implementations.

## :package: `@ts-messaging/common`

### `Channel`
```ts
export interface Channel {
    readonly name: string;

    findContract(): Promise<Contract | null>;
}
```

### `ChannelFactory`
The `ChannelFactory` is used by the `Broker` to create a `Channel` from the name of the channel. The `ChannelFactory` is broker-specific and is implemented by each client package.

```ts
export interface ChannelFactory{
    produce(input: { name: string }): Promise<Channel>;
}
```

## :package: `@ts-messaging/client`

### `AbstractChannel`

The `AbstractChannel` is the base class for all broker-specific implementations of the `Channel` interface. The `AbstractChannel` is responsible for caching the contract associated with the channel.

```ts
import { Schema } from "./Schema";

export abstract class AbstractContract implements Channel {

    abstract readonly name: string;
    protected contract: Promise<Contract | null> | undefined;
    
    //The broker-specific loading of the contract
    protected abstract loadContract(): Promise<Contract | null>;

    //Caching mechanism for the contract
    async findContract(): Promise<Contract | null> {
        if (this.contract) {
            return this.contract;
        }

        this.contract = this.loadContract();
        const value = await this.contract;

        if (!value) {
            this.contract = undefined;
        }

        return value;
    }
}
```

