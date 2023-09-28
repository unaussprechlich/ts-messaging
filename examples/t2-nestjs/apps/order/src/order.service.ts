import { Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from './repository/OrderRepository';
import { OrderItem, OrderStatus } from './repository/OrderItem';

@Injectable()
export class OrderService {
  oderRepository: OrderRepository = new OrderRepository();

  createOrder(sessionID: string) {
    const order = this.oderRepository.save(new OrderItem(sessionID));
    Logger.log('order created ...', { order });
    return order;
  }

  rejectOrder(orderId: string) {
    const orders = this.oderRepository.findAll();

    for (const order of orders) {
      if (order.sessionID === orderId) {
        Logger.log('order failed ...', { order });
        order.status = OrderStatus.FAILURE;
        return this.oderRepository.save(order);
      }
    }

    throw new Error('Order not found');
  }
}
