import { getOneConfig } from './one-config/utils';
const { rateLimit, rateLimitTimeFrame = '' } = getOneConfig();

// TODO: move to OneConfig
// requests per RATE_LIMIT_TIME_FRAME
export const RATE_LIMIT = rateLimit;
export const RATE_LIMIT_TIME_FRAME = rateLimitTimeFrame;
