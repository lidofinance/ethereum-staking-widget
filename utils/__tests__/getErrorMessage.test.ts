import {
  getErrorMessage,
  ErrorMessage,
  extractCodeFromError,
} from '../getErrorMessage';

console.error = jest.fn();

describe('getErrorMessage', () => {
  it('should return NOT_ENOUGH_ETHER error message when error code is -32000', () => {
    const error = { code: -32000 };
    expect(getErrorMessage(error)).toBe(ErrorMessage.NOT_ENOUGH_ETHER);
  });

  it('should return DENIED_SIG error message when error code is 4001', () => {
    const error = { code: 4001 };
    expect(getErrorMessage(error)).toBe(ErrorMessage.DENIED_SIG);
  });

  it('should return LIMIT_REACHED error message when error reason includes STAKE_LIMIT', () => {
    const error = { reason: 'STAKE_LIMIT' };
    expect(getErrorMessage(error)).toBe(ErrorMessage.LIMIT_REACHED);
  });

  it('should return ACTION_REJECTED error message when error message includes "denied message signature"', () => {
    const error = { message: 'denied message signature' };
    expect(getErrorMessage(error)).toBe(ErrorMessage.DENIED_SIG);
  });

  it('should return ENABLE_BLIND_SIGNING error message when error name is "EthAppPleaseEnableContractData"', () => {
    const error = { name: 'EthAppPleaseEnableContractData' };
    expect(getErrorMessage(error)).toBe(ErrorMessage.ENABLE_BLIND_SIGNING);
  });

  it('should return SOMETHING_WRONG error message when error is undefined', () => {
    const error = undefined;
    expect(getErrorMessage(error)).toBe(ErrorMessage.SOMETHING_WRONG);
  });
});

describe('extractCodeFromError', () => {
  test('returns 0 for non-object errors', () => {
    expect(extractCodeFromError(null)).toBe(0);
    expect(extractCodeFromError(undefined)).toBe(0);
    expect(extractCodeFromError('error')).toBe(0);
    expect(extractCodeFromError(123)).toBe(0);
  });

  test('extracts error code from reason array', () => {
    const error = { reason: 'STAKE_LIMIT' };
    expect(extractCodeFromError(error)).toBe('LIMIT_REACHED');
  });

  test('extracts error code from message string', () => {
    const error = { message: 'Transaction was rejected' };
    expect(extractCodeFromError(error)).toBe('ACTION_REJECTED');
  });

  test('extracts error code from Ledger Live error data', () => {
    const error = {
      data: [{ message: 'Transaction was rejected' }],
    };
    expect(extractCodeFromError(error)).toBe('ACTION_REJECTED');
  });

  test('extracts error code from name string', () => {
    const error = { name: 'EthAppPleaseEnableContractData' };
    expect(extractCodeFromError(error)).toBe('ENABLE_BLIND_SIGNING');
  });

  test('extracts error code from code string', () => {
    const error = { code: 'INVALID_ARGUMENT' };
    expect(extractCodeFromError(error)).toBe('INVALID_ARGUMENT');
  });

  test('extracts error code from code number', () => {
    const error = { code: 400 };
    expect(extractCodeFromError(error)).toBe(400);
  });

  test('extracts error code from nested error object', () => {
    const error = { error: { code: 'INVALID_ARGUMENT' } };
    expect(extractCodeFromError(error)).toBe('INVALID_ARGUMENT');
  });
});
