import { ReservationItem } from './ReservationItem';
import { Repository } from 'lib/repository';

export class ReservationRepository extends Repository<ReservationItem> {
  static instance: ReservationRepository = new ReservationRepository();
}
