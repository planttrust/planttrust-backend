const crypto = require('crypto');

const hashEvent = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
};

module.exports = { hashEvent };
