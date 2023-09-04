---
layout: doc
---

# What is ts-messaging?

The ts-messaging framework is used to build type-consistent messaging systems in TypeScript. The initial implementation was made for the Kafka ecosystem, but the internal architecture should work with any messaging platform. 

::: tip
Just want to try it out? Skip to the [Quickstart](./quickstart).
:::

## Key Features
- **In-Code Schema Definition**
 
  Instead of downloading the schema from a registry, the [schema](/architecture/schema) is defined in TypeScript. This allows for a more seamless development experience as no generators are required. Schema changes are automatically committed to the registry whenever a Producer or Consumer is launched.

- **Endpoint Definition**

  The [endpoints](/architecture/endpoint) are defined through metaprogramming. Consumer registration and schema administration is performed by the framework, so the developer can assume that each endpoint will only be invoked if the message matches the correct schema and the message data has already been validated.
