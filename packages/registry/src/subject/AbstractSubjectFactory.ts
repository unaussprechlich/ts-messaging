import { Subject, SubjectFactory } from '@ts-messaging/common';

export abstract class AbstractSubjectFactory implements SubjectFactory {
  abstract produce(input: { name: string }): Promise<Subject>;
}
