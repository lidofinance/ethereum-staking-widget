import {
  QuoteMismatchError,
  TransactionRevertedError,
  TxFlowInterruptedError,
  TxSentDataUnavailableError,
  TxSettledError,
  TxStaleError,
} from '../utils/errors';
import type { TxFlowContext } from './types';
import { detectTxFlowInterruption } from './detect-tx-flow-interruption';
import {
  getError,
  ErrorMessage,
  isRetryableTxError,
} from 'utils/getErrorMessage';

const context = (status: TxFlowContext['status']): TxFlowContext => ({
  status,
  calls: [],
  isAA: false,
  data: undefined,
});
const preparations = [
  {
    stepId: 'approve',
    message: 'Approval completed; continue with the deposit.',
  },
  { stepId: 'reset', message: 'Approval reset; continue with approval.' },
];
const classify = (error: unknown, status: TxFlowContext['status']) =>
  detectTxFlowInterruption(error, context(status), 'deposit', preparations);

describe('preparation interruption', () => {
  it('keeps insufficient-gas guidance and suppresses Retry after approval', () => {
    const error = { code: 'INSUFFICIENT_FUNDS' };
    const result = classify(error, { approve: 'done' });
    expect(getError(result)).toBe(ErrorMessage.NOT_ENOUGH_ETHER);
    expect(isRetryableTxError(result)).toBe(false);
  });

  it.each([4100, 4900, 4901, 'ENABLE_BLIND_SIGNING', 'DEVICE_LOCKED'])(
    'preserves actionable wallet error %s after approval',
    (code) => {
      const error = { code };
      expect(classify(error, { approve: 'done' })).toBe(error);
    },
  );

  it('reports the completed approval when signing the main step is declined', () => {
    const error = new Error('User rejected');
    expect(classify(error, { approve: 'done' })).toMatchObject({
      name: 'TxFlowInterruptedError',
      message: 'Approval completed; continue with the deposit.',
      cause: error,
    });
  });

  it('unwraps a settled preparation read error and reports the flow as incomplete', () => {
    const cause = new Error('Read failed');
    const result = classify(new TxSettledError(cause), { approve: 'settled' });
    expect(result).toBeInstanceOf(TxFlowInterruptedError);
    expect(result).toMatchObject({ cause });
  });

  it('reports the most advanced completed preparation', () => {
    expect(
      classify(new Error('failed'), { reset: 'done', approve: 'done' }),
    ).toMatchObject({
      message: 'Approval completed; continue with the deposit.',
    });
    expect(classify(new Error('failed'), { reset: 'done' })).toMatchObject({
      message: 'Approval reset; continue with approval.',
    });
  });

  it.each([
    new QuoteMismatchError(),
    new TxStaleError(),
    new TxSentDataUnavailableError(new Error('timeout')),
  ])('preserves actionable and unsafe-to-retry errors ($name)', (error) => {
    expect(classify(error, { approve: 'done' })).toBe(error);
  });

  it.each(['sent', 'settled', 'done'] as const)(
    'preserves the main step error after it is %s',
    (status) => {
      const error = new TxSettledError(new Error('Read failed'));
      expect(classify(error, { approve: 'done', deposit: status })).toBe(error);
    },
  );

  it('keeps a definite main transaction revert rather than claiming it was never sent', () => {
    const error = new TransactionRevertedError({ status: 'reverted' } as never);
    expect(classify(error, { approve: 'done', deposit: 'sent' })).toBe(error);
  });

  it('does not claim an unconfirmed approval completed', () => {
    const error = new Error('Approval rejected');
    expect(classify(error, { approve: 'sent' })).toBe(error);
  });
});
