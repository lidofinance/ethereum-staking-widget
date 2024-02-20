import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
const { rateLimit, rateLimitTimeFrame } = serverRuntimeConfig;

// TODO: move to OneConfig
// requests per RATE_LIMIT_TIME_FRAME
export const RATE_LIMIT = rateLimit;
export const RATE_LIMIT_TIME_FRAME = rateLimitTimeFrame;
