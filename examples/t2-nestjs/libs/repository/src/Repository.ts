export class Item {
  __id: string | null = null;

  get id() {
    return this.__id;
  }

  set id(id: string | null) {
    this.__id = id;
  }
}

export class Repository<T extends Item> {
  private currentID = 0;
  private readonly repository: Map<string, T> = new Map();

  create(item: T) {
    const id = (this.currentID++).toString();
    item.__id = id;
    this.repository.set(id, item);
    return item;
  }

  findById(id: string) {
    return this.repository.get(id);
  }

  findAll() {
    return Array.from(this.repository.values()) as T[];
  }

  save(item: T): T {
    if (!item.__id) {
      this.create(item);
    } else {
      this.repository.set(item.__id, item);
    }

    return item;
  }

  saveAll(items: T[]) {
    return items.map((item) => this.save(item));
  }

  delete(item: T) {
    if (!item.__id) {
      throw new Error('Item has no ID');
    }
    this.repository.delete(item.__id);
  }

  clear() {
    this.repository.clear();
  }

  count() {
    return this.repository.size;
  }

  has(id: string) {
    return this.repository.has(id);
  }

  keys() {
    return Array.from(this.repository.keys()) as string[];
  }
}
