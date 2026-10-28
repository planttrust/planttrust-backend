try {
  module.exports = require('./dist/server');
} catch (e) {
  try {
    require('tsx/cjs');
    module.exports = require('./src/server');
  } catch (err) {
    throw e;
  }
}
