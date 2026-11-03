import type { Hash } from 'viem';

export type L2SlowStakeLookupSource = 'ccip-api' | 'l1' | 'l2';

// A status could not be established: one of the three places it is read
// from did not answer. Distinct from a stake that failed, which is a status
export class L2SlowStakeLookupError extends Error {
  readonly source: L2SlowStakeLookupSource;
  readonly messageId?: Hash;

  constructor(
    source: L2SlowStakeLookupSource,
    message: string,
    options?: { messageId?: Hash; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'L2SlowStakeLookupError';
    this.source = source;
    this.messageId = options?.messageId;
  }
}
