import { TRANSACTION_ERROR } from '../consts';

export const deny = (code: number) => ({
  allowed: false as const,
  reason: TRANSACTION_ERROR(code),
});
