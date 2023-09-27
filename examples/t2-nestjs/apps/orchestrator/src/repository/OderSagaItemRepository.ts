import { OrderSagaItem } from './OrderSagaItem';
import { Repository } from 'lib/repository';

export class OderSagaItemRepository extends Repository<OrderSagaItem> {
  static instance: OderSagaItemRepository = new OderSagaItemRepository();
}
