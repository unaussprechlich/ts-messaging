import { InventoryRepository } from '../repository/InventoryRepository';
import { InventoryItem } from '../repository/InventoryItem';

export class DataGenerator {
  inventoryRepository = InventoryRepository.instance;
  inventorySize: number;

  constructor(inventorySize: number) {
    this.inventorySize = inventorySize;
  }

  generateProducts() {
    if (this.inventoryRepository.count() >= this.inventorySize) {
      console.info('Inventory is already filled');
      return;
    }

    if (this.inventorySize > PRODUCT_NAMES.length) {
      this.inventorySize = PRODUCT_NAMES.length;
    }

    for (
      let i = this.inventoryRepository.count();
      i < this.inventorySize;
      i++
    ) {
      const product = PRODUCT_NAMES[i];
      const units = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 10) + Math.random() * 10;
      const description = 'Very nice ' + product + 'tea!';

      const inventoryItem = new InventoryItem(
        product,
        description,
        units,
        price,
      );

      this.inventoryRepository.save(inventoryItem);
    }
  }

  restockProducts() {
    const items = this.inventoryRepository.findAll();

    for (const item of items) {
      item.units = item.units + Math.floor(Math.random() * 1000);
    }

    this.inventoryRepository.saveAll(items);
    console.info('Restocked products!');
  }
}

const PRODUCT_NAMES = [
  'Earl Grey (loose)',
  'Assam (loose)',
  'Darjeeling (loose)',
  'Frisian Black Tee (loose)',
  'Anatolian Assam (loose)',
  'Earl Grey (20 bags)',
  'Assam (20 bags)',
  'Darjeeling (20 bags)',
  'Ceylon (loose)',
  'Ceylon (20 bags)',
  'House blend (20 bags)',
  'Assam with Ginger (20 bags)',
  'Sencha (loose)',
  'Sencha (15 bags)',
  'Sencha (25 bags)',
  'Earl Grey Green (loose)',
  'Earl Grey Green (15 bags)',
  'Earl Grey Green (25 bags)',
  'Matcha 30 g',
  'Matcha 50 g',
  'Matcha 100 g',
  'Gunpowder Tea (loose)',
  'Gunpowder Tea (15 bags)',
  'Gunpowder Tea (25 bags)',
  'Camomile (loose)',
  'Camomile (15 bags)',
  'Peepermint (loose)',
  'Peppermint (15 bags)',
  'Peppermint (15 bags)',
  'Sweet Mint (loose)',
  'Sweet Mint (15 bags)',
  'Sweet Mint (25 bags)',
  'Lemongrass (loose)',
  'Lemongrass (20 bags)',
  'Chai Mate (15 bags)',
  'Chai Mate (25 bags)',
  'Stomach Soothing Tea (15 bags)',
  'Headache Soothing Tea (15 bags)',
  'Rooibos Pure (loose)',
  'Rooibos Pure (20 bags)',
  'Rooibos Orange (loose)',
  'Rooibos Orange (20 bags)',
  'Rooibos Coconut (loose)',
  'Rooibos Coconut (20 bags)',
  'Rooibos Vanilla (loose)',
  'Rooibos Pure (20 bags)',
  'Rooibos Ginger (loose)',
  'Rooibos Pure (20 bags)',
  'Rooibos Grapefruit (loose)',
  'Rooibos Pure (20 bags)',
  'White Tea (loose)',
  'White Tea (15 bags)',
  'White Tea (25 bags)',
  'White Chai (loose)',
  'White Chai (15 bags)',
  'White Chai (25 bags)',
  'Pai Mu Tan White (loose)',
  'Pai Mu Tan White (15 bags)',
  'Pai Mu Tan White (25 bags)',
  'White Apricot (loose)',
  'White Apricot (15 bags)',
  'White Apricot (25 bags)',
];
