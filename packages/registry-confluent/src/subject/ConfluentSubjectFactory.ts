import { ConfluentSubject } from './ConfluentSubject';
import { AbstractSubjectFactory } from '@ts-messaging/registry';
import { ConfluentRegistry } from '../registry';
import { CompatabilityStrategy } from '@ts-messaging/common';
import { ConfluentError } from '../ConfluentError';

export class ConfluentSubjectFactory extends AbstractSubjectFactory {
  constructor(private readonly registry: ConfluentRegistry) {
    super();
  }

  async produce(input: { name: string }): Promise<ConfluentSubject> {
    const compatabilityStrategy = await this.loadSubjectCompatabilityStrategy(
      input.name
    );

    if (compatabilityStrategy) {
      return new ConfluentSubject(
        input.name,
        compatabilityStrategy,
        this.registry
      );
    }

    return new ConfluentSubject(
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

  private async loadSubjectCompatabilityStrategy(subject: string) {
    const request = {
      params: { subject },
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
