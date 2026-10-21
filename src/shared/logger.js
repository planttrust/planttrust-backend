const pino = require('pino');

const createLogger = (moduleName) => {
  return pino({
    transport: {
      target: 'pino-pretty'
    },
    base: {
      module: moduleName
    }
  });
};

module.exports = createLogger;
