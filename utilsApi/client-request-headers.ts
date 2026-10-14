import { isIP } from 'net';
import type { NextApiRequest } from 'next';

// what the end client sent, so the validation API can tell it apart from us
export const CLIENT_IP_HEADER = 'X-Client-IP';
export const CLIENT_USER_AGENT_HEADER = 'X-Client-User-Agent';
export const CLIENT_REFERER_HEADER = 'X-Client-Referer';

const MAX_HEADER_VALUE_LENGTH = 512;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeIp = (value: string) => value.trim().replace(/^::ffff:/i, '');

// printable ASCII only: an invalid header value makes fetch() throw
const sanitizeHeaderValue = (value: string | undefined) => {
  const clean = value
    ?.replace(/[^\u0020-\u007E]/g, '')
    .trim()
    .slice(0, MAX_HEADER_VALUE_LENGTH);
  return clean || undefined;
};

// CF header only: the socket peer is shared by all users, XFF is client-controlled
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
