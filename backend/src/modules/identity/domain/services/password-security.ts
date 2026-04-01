import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from 'node:crypto';

const PASSWORD_HASH_KEY_LENGTH = 64;

export function verifyPasswordHash(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(':');

  if (algorithm !== 'scrypt' || !salt || !hash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, PASSWORD_HASH_KEY_LENGTH).toString('hex');

  return timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(derivedHash, 'hex')
  );
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, PASSWORD_HASH_KEY_LENGTH).toString('hex');

  return `scrypt:${salt}:${hash}`;
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function generateSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function deriveCsrfToken(accessToken: string, sessionSecret: string) {
  return createHmac('sha256', sessionSecret)
    .update(`csrf:${accessToken}`)
    .digest('base64url');
}

export function isMatchingCsrfToken(
  providedToken: string,
  expectedToken: string
) {
  if (providedToken.length !== expectedToken.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(providedToken),
    Buffer.from(expectedToken)
  );
}
