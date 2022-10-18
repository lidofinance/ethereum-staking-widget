import { NextApiResponse, NextApiRequest } from 'next';
import { RATE_LIMIT_TIME_FRAME } from 'config';

type RateLimitStorageType = {
  [key: string]: { value: number; timeoutId?: NodeJS.Timeout };
};

type RateLimitedResponse = (data: { res: NextApiResponse; id: string }) => void;

type SetRateLimit = (data: {
  req: NextApiRequest;
  res: NextApiResponse;
  limit: number;
  timeFrame: number;
}) => NextApiResponse;

const RATE_LIMIT_HEADERS = {
  limit: `X-RateLimit-Limit`,
  remaining: `X-RateLimit-Remaining`,
  reset: `X-RateLimit-Reset`,
};

export class RateLimitStorage {
  constructor() {
    this._storage = {};
  }
  private _durationMs = RATE_LIMIT_TIME_FRAME * 1000;
  private _storage: RateLimitStorageType;

  set(key: string, value: number) {
    this._storage[key] = { value };

    if (this._storage[key].timeoutId) {
      clearTimeout(this._storage[key].timeoutId);
    }

    this._storage[key].timeoutId = setTimeout(() => {
      this.delete(key);
    }, this._durationMs);
  }

  get(key: string) {
    return this._storage[key].value;
  }

  inc(key: string) {
    if (this._storage[key] !== undefined) {
      this.set(key, this._storage[key].value + 1);
    } else {
      this.set(key, 0);
    }

    return this.get(key);
  }
  delete(key: string) {
    if (this._storage[key]) {
      if (this._storage[key].timeoutId) {
        clearTimeout(this._storage[key].timeoutId);
      }
      delete this._storage[key];
    }
  }
}
const rateLimitStorage = new RateLimitStorage();

// now we use headers from "cloudflare" and rely on their validity.
// If there are no "cloudflare" headers, we use the "x-forwarded-for" header,
// but keep in mind that these headers can be changed by anyone
// https://developers.cloudflare.com/fundamentals/get-started/reference/http-request-headers/
const getIP = (req: NextApiRequest) => {
  const cfConnectionIp = req.headers['cf_connecting_ip'];
  const xff = req.headers['x-forwarded-for'];

  if (cfConnectionIp) return cfConnectionIp;

  return xff ? (Array.isArray(xff) ? xff[0] : xff.split(',')[0]) : '127.0.0.1';
};

const rateLimitedResponse: RateLimitedResponse = ({ id, res }) => {
  res.status(429).json({
    error: { message: `API rate limit exceeded for ${id}` },
  });
};

export const setRateLimit: SetRateLimit = (data) => {
  const { res, req, limit, timeFrame } = data;
  const headers = RATE_LIMIT_HEADERS;
  const id = `ip:${getIP(req)}`;

  const time = Math.floor(Date.now() / 1000 / timeFrame);
  const key = `${id}:${time}`;

  const callCount = rateLimitStorage.inc(key);
  const remaining = limit - callCount;
  const reset = (time + 1) * timeFrame;

  res.setHeader(headers.limit, `${limit}`);
  res.setHeader(headers.remaining, `${remaining < 0 ? 0 : remaining}`);
  res.setHeader(headers.reset, `${reset}`);

  if (remaining < 0) rateLimitedResponse({ id, res });

  return res;
};
