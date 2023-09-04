import { pino, Logger as PinoLogger } from 'pino';

const BaseLogger = pino({
  level: 'debug',
  name: '@ts-messaging',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd.mm.yyyy HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  },
});

export function LoggerChild(config: {
  package: string;
  name: string;
  uuid: string;
}) {
  const logger = BaseLogger.child({
    name: `@ts-messaging/${config.package}::${config.name}::${config.uuid}`,
  });

  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    newError: (message: string, ...args: any[]) => {
      const error = new Error(message);
      logger.error(error, ...args);
      return error;
    },
    proxyError: (error: Error) => {
      logger.error(error);
      return error;
    },
  } as Pick<PinoLogger, 'info' | 'warn' | 'error' | 'debug'> & {
    newError: (message: string, ...args: any[]) => Error;
    proxyError: (error: Error) => Error;
  };
}

export type Logger = ReturnType<typeof LoggerChild>;
