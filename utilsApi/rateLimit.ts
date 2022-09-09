import { NextApiResponse, NextApiRequest } from 'next';

const RATE_LIMIT_HEADERS = [
  `X-RateLimit-Limit`,
  `X-RateLimit-Remaining`,
  `X-RateLimit-Reset`,
];

export class MemoryStorage {
  constructor() {
    this._storage = {};
  }
  private _storage: { [key: string]: number };

  set(key: string, value: number) {
    this._storage[key] = value;
  }

  get(key: string) {
    return this._storage[key];
  }

  inc(key: string) {
    if (this._storage[key] !== undefined) {
      this._storage[key] = this._storage[key] + 1;
    } else {
      this._storage[key] = 0;
    }

    return this._storage[key];
  }
}
const Memory = new MemoryStorage();

const getIP = (req: NextApiRequest) => {
  const xff = req.headers['x-forwarded-for'];

  return xff ? (Array.isArray(xff) ? xff[0] : xff.split(',')[0]) : '127.0.0.1';
};

const rateLimitedResponse = ({
  id,
  res,
}: {
  id: string;
  res: NextApiResponse;
}) => {
  res.status(429).json({
    error: { message: `API rate limit exceeded for ${id}` },
  });
};

export const setRateLimit = (data: {
  req: NextApiRequest;
  res: NextApiResponse;
  limit: number;
  timeFrame: number;
}) => {
  const { res, req, limit, timeFrame } = data;
  const headers = RATE_LIMIT_HEADERS;
  const id = `ip:${getIP(req)}`;

  const time = Math.floor(Date.now() / 1000 / timeFrame);
  const key = `${id}:${time}`;

  const callCount = Memory.inc(key);
  const remaining = limit - callCount;
  const reset = (time + 1) * timeFrame;

  if (headers[0]) res.setHeader(headers[0], `${limit}`);
  if (headers[1]) res.setHeader(headers[1], `${remaining < 0 ? 0 : remaining}`);
  if (headers[2]) res.setHeader(headers[2], `${reset}`);

  if (remaining < 0) {
    rateLimitedResponse({ id, res });
  }

  return res;
};
