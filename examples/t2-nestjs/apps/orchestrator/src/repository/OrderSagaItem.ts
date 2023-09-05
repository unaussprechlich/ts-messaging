import { Item } from 'lib/repository';

export class OrderSagaItem extends Item {
  sessionId: string;

  payload: {
    cardNumber: string;
    cardOwner: string;
    checksum: string;
    total: number;
  };

  constructor(data: {
    sessionId: string;
    cardNumber: string;
    cardOwner: string;
    checksum: string;
    total: number;
  }) {
    super();
    this.sessionId = data.sessionId;
    this.payload = {
      cardNumber: data.cardNumber,
      cardOwner: data.cardOwner,
      checksum: data.checksum,
      total: data.total,
    };
  }
}
