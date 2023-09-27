import { Injectable } from '@nestjs/common';
import { OderSagaItemRepository } from './repository/OderSagaItemRepository';
import { SagaKey } from 'lib/saga/schemas/SagaKey';
import { OrderSagaItem } from './repository/OrderSagaItem';

@Injectable()
export class OrchestratorService {
  readonly repository = OderSagaItemRepository.instance;

  createSagaItem(data: {
    sessionId: string;
    cardNumber: string;
    cardOwner: string;
    checksum: string;
    total: number;
  }) {
    const saga = new OrderSagaItem(data);
    const item = this.repository.save(saga);

    if (!item.__id) {
      throw new Error('Saga item id is null');
    }

    return new SagaKey(item.__id);
  }

  findSagaItem(key: SagaKey) {
    const item = this.repository.findById(key.id);

    if (!item) {
      throw new Error('Saga item is null');
    }

    return item;
  }
}
