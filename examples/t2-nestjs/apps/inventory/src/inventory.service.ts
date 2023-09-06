import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './repository/InventoryRepository';
import { z } from 'zod';
import { ReservationRepository } from './repository/ReservationRepository';

@Injectable()
export class InventoryService {
  readonly reservationRepository: ReservationRepository =
    ReservationRepository.instance;
  readonly inventoryRepository: InventoryRepository =
    InventoryRepository.instance;

  commitReservations(sessionID: string) {
    const inventoryItems = this.inventoryRepository.findAll();
    for (const inventoryItem of inventoryItems) {
      inventoryItem.commitReservation(sessionID);
    }

    this.inventoryRepository.saveAll(inventoryItems);

    const reservations = this.reservationRepository.findAll();
    for (const reservation of reservations) {
      if (reservation.userID === sessionID) {
        this.reservationRepository.delete(reservation);
      }
    }
  }

  deleteReservations(sessionID: string) {
    const inventoryItems = this.inventoryRepository.findAll();
    for (const inventoryItem of inventoryItems) {
      inventoryItem.deleteReservation(sessionID);
    }

    this.inventoryRepository.saveAll(inventoryItems);

    const reservations = this.reservationRepository.findAll();
    for (const reservation of reservations) {
      if (reservation.userID === sessionID) {
        this.reservationRepository.delete(reservation);
      }
    }
  }

  makeReservation(productId: string, sessionId: string, units: number) {
    const inventoryItem = this.inventoryRepository.findById(productId);

    if (!inventoryItem) throw new Error('Product not found');

    const reservation = inventoryItem.addReservation(
      sessionId,
      z.number().int().positive().parse(units)
    );

    this.reservationRepository.save(reservation);

    return reservation;
  }
}
