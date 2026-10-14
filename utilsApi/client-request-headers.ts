import { isIP } from 'net';
import type { NextApiRequest } from 'next';

// The validation API sits behind this server, so every request it sees comes
// from us. These headers carry what the end client sent, letting it tell
// browsers apart from scripted pollers.
export const CLIENT_IP_HEADER = 'X-Client-IP';
export const CLIENT_USER_AGENT_HEADER = 'X-Client-User-Agent';
export const CLIENT_REFERER_HEADER = 'X-Client-Referer';

const MAX_HEADER_VALUE_LENGTH = 512;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeIp = (value: string) => value.trim().replace(/^::ffff:/i, '');

// Printable ASCII only: fetch() rejects a request whose header value it
// considers invalid, and that would fail the proxied call for a real user.
const sanitizeHeaderValue = (value: string | undefined) => {
  const clean = value
    ?.replace(/[^\u0020-\u007E]/g, '')
    .trim()
    .slice(0, MAX_HEADER_VALUE_LENGTH);
  return clean || undefined;
};

// Cloudflare's header only. Unlike @lidofinance/next-ip-rate-limit there is no
// socket fallback: behind the proxy that is one address shared by every user,
// and a consumer limiting on it would throttle them all. X-Forwarded-For is
// skipped too — the client controls it.
export const getClientIp = (req: NextApiRequest): string | undefined => {
  const cfIp = firstValue(req.headers['cf-connecting-ip'])?.split(',')[0];
  if (!cfIp) return undefined;

  const ip = normalizeIp(cfIp);
  return isIP(ip) ? ip : undefined;
};

export const getClientRequestHeaders = (
  req: NextApiRequest,
): Record<string, string> => {
  const values: [string, string | undefined][] = [
    [CLIENT_IP_HEADER, getClientIp(req)],
    [
      CLIENT_USER_AGENT_HEADER,
      sanitizeHeaderValue(firstValue(req.headers['user-agent'])),
    ],
    [
      CLIENT_REFERER_HEADER,
      sanitizeHeaderValue(firstValue(req.headers['referer'])),
    ],
  ];

  return Object.fromEntries(
    values.filter((entry): entry is [string, string] => !!entry[1]),
  );
};
