import { Item } from 'lib/repository';

export enum OrderStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export class OrderItem extends Item {
  sessionID: string;
  status: OrderStatus;
  timestamp: Date;

  constructor(sessionID: string) {
    super();
    this.sessionID = sessionID;
    this.status = OrderStatus.SUCCESS;
    this.timestamp = new Date();
  }
}
