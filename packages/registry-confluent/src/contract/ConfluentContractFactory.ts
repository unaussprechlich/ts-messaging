import { ConfluentContract } from './ConfluentContract';
import { ConfluentRegistry } from '../registry';
import { CompatabilityStrategy } from '@ts-messaging/common';
import { ConfluentError } from '../ConfluentError';
import { ContractFactory } from '@ts-messaging/registry';

export class ConfluentContractFactory implements ContractFactory {
  constructor(private readonly registry: ConfluentRegistry) {}

  async produce(input: { name: string }): Promise<ConfluentContract> {
    const compatabilityStrategy = await this.loadContractCompatabilityStrategy(
      input.name
    );

    if (compatabilityStrategy) {
      return new ConfluentContract(
        input.name,
        compatabilityStrategy,
        this.registry
      );
    }

    return new ConfluentContract(
      input.name,
      await this.loadGlobalCompatabilityStrategy(),
      this.registry
    );
  }

  private async loadGlobalCompatabilityStrategy() {
    const request = {};

    const response = await this.registry.api.client.config.get(request);

    if (response.status === 200) {
      return this.processCompatabilityStrategy(
        response.body.compatibilityLevel
      );
    } else {
      throw new ConfluentError(
        this.registry.api.contract.config.get,
        request,
        response
      );
    }
  }

  private async loadContractCompatabilityStrategy(contractName: string) {
    const request = {
      params: { subject: contractName },
      query: { defaultToGlobal: true },
    };

    const response = await this.registry.api.client.config.subject.get(request);

    if (response.status === 200) {
      return this.processCompatabilityStrategy(
        response.body.compatibilityLevel
      );
    } else if (response.status === 404) {
      return null;
    } else {
      throw new ConfluentError(
        this.registry.api.contract.config.subject.get,
        request,
        response
      );
    }
  }

  private processCompatabilityStrategy(compatability: string) {
    switch (compatability) {
      case 'BACKWARD':
        return CompatabilityStrategy.BACKWARD;
      case 'BACKWARD_TRANSITIVE':
        return CompatabilityStrategy.BACKWARD_TRANSITIVE;
      case 'FORWARD':
        return CompatabilityStrategy.FORWARD;
      case 'FORWARD_TRANSITIVE':
        return CompatabilityStrategy.FORWARD_TRANSITIVE;
      case 'FULL':
        return CompatabilityStrategy.FULL;
      case 'FULL_TRANSITIVE':
        return CompatabilityStrategy.FULL_TRANSITIVE;
      case 'NONE':
        return CompatabilityStrategy.NONE;
      default:
        throw new Error(`Unknown compatability strategy: ${compatability}`);
    }
  }
}
