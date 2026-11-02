import crypto from 'crypto';

export const hashEvent = (data: unknown): string => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
};

export default { hashEvent };
