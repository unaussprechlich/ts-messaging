import { Body, Controller, Get, Post } from '@nestjs/common';
import { DataGenerator } from './utils/DataGenerator';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  private dataGenerator = new DataGenerator(20);

  constructor(protected readonly inventoryService: InventoryService) {}

  @Post('inventory/reservations')
  addReservation(
    @Body() body: { sessionId: string; productId: string; units: number },
  ) {
    return this.inventoryService.makeReservation(
      body.productId,
      body.sessionId,
      body.units,
    );
  }

  @Get('generate')
  generateData() {
    this.dataGenerator.generateProducts();
  }

  @Get('restock')
  restock() {
    this.dataGenerator.restockProducts();
  }
}
