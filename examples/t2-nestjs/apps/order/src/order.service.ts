import { Injectable } from '@nestjs/common';
import { OrderRepository } from './repository/OrderRepository';
import { OrderItem, OrderStatus } from './repository/OrderItem';

@Injectable()
export class OrderService {
  oderRepository: OrderRepository = new OrderRepository();

  createOrder(sessionID: string) {
    const order = new OrderItem(sessionID);
    return this.oderRepository.save(order);
  }

  rejectOrder(orderId: string) {
    const order = this.oderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.status = OrderStatus.FAILURE;
    return this.oderRepository.save(order);
  }
}
