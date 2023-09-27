import { Connectable, Entrypoint, Initable } from '../interfaces';
import { Broker } from './broker';
import { Registry } from '../registry';

export interface Client extends Entrypoint, Initable, Connectable {
  readonly broker: Broker;
  readonly registry: Registry;
}
