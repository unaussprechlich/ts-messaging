import { Subject } from './SubjectInterface';

export interface SubjectFactory {
  produce(input: { name: string }): Promise<Subject>;
}
