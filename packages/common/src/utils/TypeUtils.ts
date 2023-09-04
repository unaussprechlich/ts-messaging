export type Constructor<T = any> = { new (...args: any[]): T };
export type ConstructorWithArgs<A extends any[], T = any> = {
  new (...args: A): T;
};

export type TargetMatchPropertyType<T, V> = {
  [K in keyof T]-?: V extends T[K] ? K : never;
}[keyof T];

export type Keyof<T extends object> = Extract<keyof T, string>;

export type AsRaw<T, Raw> = T extends Raw ? T : never;

export type CastConstructorToInstanceType<T> = T extends Constructor<T>
  ? InstanceType<T>
  : never;

export type InferArray<T> = T extends Array<infer U> ? U : never;

/**
 * Deconstructs a type to its base types
 */
export type Deconstruct<T> = {
  [key in keyof T]: T[key];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type ExcludeNull<T> = Exclude<T, null>;
export type ExcludeUndefined<T> = Exclude<T, undefined>;

export type OptionalKeys<T, K extends keyof T> = Pick<Partial<T>, K> &
  Omit<T, K>;

export function ImplementsStatic<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}
