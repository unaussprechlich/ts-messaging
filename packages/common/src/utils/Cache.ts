export class Cache<Key, Value> {
  private readonly cache = new Map<Key, Promise<Value | null>>();

  constructor(private readonly fetcher: (key: Key) => Promise<Value | null>) {}

  async find(key: Key): Promise<Value | null> {
    const cached = this.cache.get(key);

    if (cached) {
      return cached;
    }

    const promise = this.fetcher(key);
    this.cache.set(key, promise);

    const value = await promise;

    //Purge the cache if the value is not found
    if (!value) {
      this.cache.delete(key);
      return null;
    }

    return value;
  }
}
