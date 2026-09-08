import { createHmac, timingSafeEqual } from 'node:crypto';

const password = process.env.ADMIN_PASSWORD ?? '';

export const ADMIN_COOKIE = 'cars911_admin';

function sign(value: string): string {
  return createHmac('sha256', `cars911:${password}`).update(value).digest('hex');
}

/** Cookie value: <issued-at>.<hmac>. Sessions last 7 days. */
export function makeSessionToken(): string {
  const issued = String(Date.now());
  return `${issued}.${sign(issued)}`;
}

export function isValidSession(token: string | undefined): boolean {
  if (!password || !token) return false;
  const [issued, mac] = token.split('.');
  if (!issued || !mac) return false;
  const expected = sign(issued);
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  return Date.now() - Number(issued) < 7 * 24 * 60 * 60 * 1000;
}

export function isCorrectPassword(attempt: string): boolean {
  if (!password) return false;
  const a = Buffer.from(attempt);
  const b = Buffer.from(password);
  return a.length === b.length && timingSafeEqual(a, b);
}
