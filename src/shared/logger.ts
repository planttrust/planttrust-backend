import pino, { Logger } from 'pino';

export const createLogger = (moduleName: string): Logger => {
  return pino({
    transport: {
      target: 'pino-pretty'
    },
    base: {
      module: moduleName
    }
  });
};

export default createLogger;
