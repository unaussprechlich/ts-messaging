import { Entrypoint } from '../interfaces';
import { Client } from './Client';

export interface ClientEntrypoint extends Entrypoint, Client {}
