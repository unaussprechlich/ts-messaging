import { InventoryItem } from './InventoryItem';
import { Repository } from 'lib/repository';

export class InventoryRepository extends Repository<InventoryItem> {
  static instance: InventoryRepository = new InventoryRepository();
}
