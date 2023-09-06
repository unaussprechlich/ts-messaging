import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { DataGenerator } from './utils/DataGenerator';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  private dataGenerator = new DataGenerator(20);

  constructor(protected readonly inventoryService: InventoryService) {}

  @Post('inventory/reservations')
  addReservation(
    @Body() body: { sessionId: string; productId: string; units: number }
  ) {
    Logger.log(
      `Making reservation for ${body.productId} with ${body.units} units ...`
    );
    const reservation = this.inventoryService.makeReservation(
      body.productId,
      body.sessionId,
      body.units
    );
    return {
      id: reservation.id,
      userId: reservation.userID,
      productId: reservation.item.id,
      units: reservation.units,
    };
  }

  @Get('generate')
  generateData() {
    this.dataGenerator.generateProducts();
    Logger.log('Generated products ...');
  }

  @Get('restock')
  restock() {
    this.dataGenerator.restockProducts();
    Logger.log('Restocked products ...');
  }
}
