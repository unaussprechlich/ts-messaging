import 'reflect-metadata';

type DefaultOptions = {
  targetKey?: string | symbol;
};

export class ReflectionHelper<T> {
  constructor(
    readonly reflectionName: string,
    readonly defaultFactory?: () => T
  ) {}

  static getDesignType(target: object, key?: string | symbol) {
    if (key) {
      return Reflect.getMetadata('design:type', target, key);
    } else {
      return Reflect.getMetadata('design:type', target);
    }
  }

  static getDesignParamTypes(target: object, key?: string | symbol) {
    if (key) {
      return Reflect.getMetadata('design:paramtypes', target, key);
    } else {
      return Reflect.getMetadata('design:paramtypes', target);
    }
  }

  static getDesignReturnType(target: object, key?: string | symbol) {
    if (key) {
      return Reflect.getMetadata('design:returntype', target, key);
    } else {
      return Reflect.getMetadata('design:returntype', target);
    }
  }

  /**
   * A utility function to hydrate and get the reflection object from a class.
   * @throws {Error} If the reflection object already exists.
   * @param metadata
   * @param target
   * @param options
   */
  annotate(target: object, metadata: T, options?: DefaultOptions): T {
    if (this.hasMetadata(target, options)) {
      throw new Error(
        `Reflection object ${this.reflectionName} already exists on ${target.constructor.name}`
      );
    }

    this.defineMetadata(target, metadata, options);

    return this.useSafeReflectWithError(target, options);
  }

  /**
   * A utility function and get the reflection object from a class.
   * @param target
   * @param options
   */
  useReflect(target: object, options?: DefaultOptions): T | null {
    return this.getMetadata(target, options) ?? null;
  }

  /**
   * A utility function to get the reflection object from a class.
   * @throws {Error} If the reflection object is not found.
   * @param target
   * @param options
   */
  useSafeReflectWithError(target: object, options?: DefaultOptions): T {
    if (!this.hasMetadata(target, options)) {
      throw new Error(
        `Reflection object ${this.reflectionName} not found on ${target.constructor.name}`
      );
    }

    return this.getMetadata(target, options);
  }

  /**
   * A utility function to get the reflection object from a class.
   * @param target
   * @param options
   */
  useSafeReflectWithDefault(
    target: object,
    options?: DefaultOptions & {
      defaultFactory?: () => T;
    }
  ): T {
    if (!this.hasMetadata(target, options)) {
      if (options?.defaultFactory) {
        this.annotate(target, options.defaultFactory(), options);
      } else if (this.defaultFactory) {
        this.annotate(target, this.defaultFactory(), options);
      } else {
        throw new Error(`Default factory is not defined.`);
      }
    }

    return this.getMetadata(target, options);
  }

  protected defineMetadata(
    target: object,
    value: T,
    options?: {
      targetKey?: string | symbol;
    }
  ): void {
    return options?.targetKey
      ? Reflect.defineMetadata(
          this.reflectionName,
          value,
          target,
          options.targetKey
        )
      : Reflect.defineMetadata(this.reflectionName, value, target);
  }

  protected getMetadata(target: object, options?: DefaultOptions) {
    return options?.targetKey
      ? Reflect.getMetadata(this.reflectionName, target, options.targetKey)
      : Reflect.getMetadata(this.reflectionName, target);
  }

  hasMetadata(target: object, options?: DefaultOptions): boolean {
    return options?.targetKey
      ? Reflect.hasMetadata(this.reflectionName, target, options.targetKey)
      : Reflect.hasMetadata(this.reflectionName, target);
  }
}
