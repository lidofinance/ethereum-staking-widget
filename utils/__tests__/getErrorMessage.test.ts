import type { TransactionReceipt } from 'viem';

import { TransactionRevertedError } from 'modules/web3/utils/transaction-reverted-error';
import {
  getErrorMessage,
  ErrorMessage,
  extractCodeFromError,
} from '../getErrorMessage';

console.error = vi.fn();

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

  // Guards the wiring between the tx-flow reverted-receipt check and the
  // user-facing copy: TransactionRevertedError must not degrade to
  // "Something went wrong."
  it('should return TRANSACTION_REVERTED error message for TransactionRevertedError', () => {
    const error = new TransactionRevertedError({
      status: 'reverted',
    } as TransactionReceipt);
    expect(getErrorMessage(error)).toBe(ErrorMessage.TRANSACTION_REVERTED);
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

  // Ledger Live sends code 3 for any signing failure; viem wraps it into
  // UnknownRpcError keeping the original message in details
  test('extracts ACTION_REJECTED from viem-wrapped Ledger Live decline', () => {
    const error = {
      name: 'UnknownRpcError',
      message:
        'An unknown RPC error occurred.\nDetails: 3: Transaction declined\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('ACTION_REJECTED');
  });

  test('extracts ACTION_REJECTED from viem-wrapped Ledger Live typed data decline', () => {
    const error = {
      name: 'UnknownRpcError',
      message:
        'An unknown RPC error occurred.\nDetails: 3: Typed Data message signed declined\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('ACTION_REJECTED');
  });

  // Hardware-wallet cancel: the transport surfaces the decline as viem
  // InternalRpcError (-32603) — `name`/`code` no longer signal a rejection,
  // so detection must fall back to the message. Both messages are verbatim
  // from Ledger repros in the withdrawals DEX (CoW) flow.
  test('extracts ACTION_REJECTED from InternalRpcError on Ledger approve cancel', () => {
    const error = {
      name: 'InternalRpcError',
      code: -32603,
      message:
        'An internal error was received.\n\nDetails: Ledger: User rejected action on device\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('ACTION_REJECTED');
  });

  test('extracts ACTION_REJECTED from InternalRpcError on Ledger typed-data cancel', () => {
    const error = {
      name: 'InternalRpcError',
      code: -32603,
      message:
        'An internal error was received.\n\nDetails: Keyring Controller signTypedMessage: HardwareWalletError: Ledger: User rejected action on device\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('ACTION_REJECTED');
  });

  test('extracts ENABLE_BLIND_SIGNING from wrapped ledger error message', () => {
    const error = {
      name: 'UnknownRpcError',
      message:
        'An unknown RPC error occurred.\nDetails: Please enable Blind signing or Contract data in the Ethereum app Settings\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('ENABLE_BLIND_SIGNING');
  });

  // Blind signing disabled on EIP-712 signing: hw-app-eth does not remap
  // 0x6a80 there, the raw transport status reaches the widget
  test('extracts ENABLE_BLIND_SIGNING from raw 0x6a80 transport status', () => {
    const error = {
      name: 'UnknownRpcError',
      message:
        'An unknown RPC error occurred.\nDetails: Ledger device: Invalid data received (0x6a80)\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('ENABLE_BLIND_SIGNING');
  });

  test('extracts DEVICE_LOCKED from wrapped ledger error message', () => {
    const error = {
      name: 'UnknownRpcError',
      message:
        'An unknown RPC error occurred.\nDetails: Ledger device: Locked device (0x5515)\nVersion: viem@2.50.4',
    };
    expect(extractCodeFromError(error)).toBe('DEVICE_LOCKED');
  });
});
