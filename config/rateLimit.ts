import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
const { rateLimit, rateLimitTimeFrame } = serverRuntimeConfig;

// requests per RATE_LIMIT_TIME_FRAME
export const RATE_LIMIT = rateLimit;
export const RATE_LIMIT_TIME_FRAME = rateLimitTimeFrame;
