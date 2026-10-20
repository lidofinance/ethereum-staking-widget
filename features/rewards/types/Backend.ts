import type { BACKEND_SCHEMA } from '../fetchers/backend';
import type { z } from 'zod';

export type Backend = z.infer<typeof BACKEND_SCHEMA>;
