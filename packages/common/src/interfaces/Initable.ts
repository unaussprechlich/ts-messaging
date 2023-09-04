export interface Initable {
  init(): Promise<void>;
}
