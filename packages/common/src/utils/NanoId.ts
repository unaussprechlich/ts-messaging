import { nanoid } from 'nanoid';

export const APPLICATION_ID = nanoid();
export { nanoid };

export interface UID {
  readonly __uid: string;
}
