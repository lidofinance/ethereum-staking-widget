import type { LIDO_TRANSFER_SCHEMA } from '../fetchers/backend';
import type { z } from 'zod';

export type LidoTransfer = z.infer<typeof LIDO_TRANSFER_SCHEMA>;
