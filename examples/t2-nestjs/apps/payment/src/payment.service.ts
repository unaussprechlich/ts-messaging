import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
  processPayment(paymentData: {
    cardNumber: string;
    cardOwner: string;
    checksum: string;
    amount: number;
  }): boolean {
    Logger.log('processPayment', paymentData);

    // Simulate random failure
    if (Math.random() < 0.1) {
      throw new Error('Random Failure');
    }

    return Math.random() > 0.5;
  }
}
