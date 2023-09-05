import { InventoryItem } from './InventoryItem';
import { Item } from 'lib/repository';

export class ReservationItem extends Item {
  creationDate: Date;
  units: number;
  userID: string;
  item: InventoryItem;

  constructor(units: number, userID: string, item: InventoryItem) {
    super();
    this.creationDate = new Date();
    this.units = units;
    this.userID = userID;
    this.item = item;
  }

  updateUnits(units: number) {
    this.units = this.units + units;
    this.renewCreationDate();
    return this.units;
  }

  renewCreationDate() {
    this.creationDate = new Date();
  }
}
