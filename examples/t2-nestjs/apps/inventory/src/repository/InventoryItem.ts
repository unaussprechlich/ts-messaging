import { ReservationItem } from './ReservationItem';
import { z } from 'zod';
import { Item } from 'lib/repository';

export class InventoryItem extends Item {
  name: string;
  description: string;
  units: number;
  price: number;
  reservations: ReservationItem[];

  constructor(name: string, description: string, units: number, price: number) {
    super();
    this.name = name;
    this.description = description;
    this.units = z.number().int().parse(units);
    this.price = z.number().positive().parse(price);
    this.reservations = [];
  }

  addReservation(sessionID: string, unitsToReserve: number) {
    const units = z.number().int().positive().parse(unitsToReserve);
    if (units > this.getAvailableUnits()) throw new Error('Not enough units');
    if (units === 0) throw new Error('Cannot reserve 0 units');

    for (const reservation of this.reservations) {
      if (reservation.userID === sessionID) {
        reservation.updateUnits(units);
        return reservation;
      }
    }

    const reservation = new ReservationItem(units, sessionID, this);
    this.reservations.push(reservation);

    return reservation;
  }

  commitReservation(sessionID: string) {
    for (const [index, reservation] of this.reservations.entries()) {
      if (reservation.userID === sessionID) {
        this.units -= reservation.units;
        delete this.reservations[index];
        return;
      }
    }
  }

  deleteReservation(sessionID: string) {
    for (const [index, reservation] of this.reservations.entries()) {
      if (reservation.userID === sessionID) {
        delete this.reservations[index];
        return;
      }
    }
  }

  getAvailableUnits() {
    const availableUnits =
      this.units - this.reservations.reduce((acc, curr) => acc + curr.units, 0);
    if (availableUnits < 0) throw new Error('Not enough units');

    return availableUnits;
  }
}
