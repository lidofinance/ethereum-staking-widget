import type { NextApiRequest, NextApiResponse } from 'next';

// coarse signals are echoed as values; IP- and street-level ones as presence
// only, so the route cannot be used as a PII echo service
const VALUE_HEADERS = [
  'cf-ipcountry',
  'cf-ipcontinent',
  'cf-region-code',
  'cf-timezone',
  'accept-language',
] as const;

const PRESENCE_HEADERS = [
  'cf-connecting-ip',
  'cf-ipcity',
  'cf-iplatitude',
  'cf-iplongitude',
  'cf-postal-code',
  'x-forwarded-for',
  'x-real-ip',
] as const;

export type GeoDebugResponse = {
  country: string | null;
  viaCloudflare: boolean;
  values: Record<string, string | null>;
  presence: Record<string, boolean>;
};

const readHeader = (req: NextApiRequest, name: string): string | undefined => {
  const value = req.headers[name];
  return Array.isArray(value) ? value.join(',') : value;
};

export const geoDebugHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GeoDebugResponse>,
) => {
  const values: Record<string, string | null> = {};
  for (const name of VALUE_HEADERS) {
    values[name] = readHeader(req, name) ?? null;
  }

  const presence: Record<string, boolean> = {};
  for (const name of PRESENCE_HEADERS) {
    presence[name] = readHeader(req, name) !== undefined;
  }

  res.status(200).json({
    // raw, not normalized: `XX`/`T1` from Cloudflare are part of the answer
    country: readHeader(req, 'cf-ipcountry') ?? null,
    viaCloudflare: readHeader(req, 'cf-ray') !== undefined,
    values,
    presence,
  });
};
