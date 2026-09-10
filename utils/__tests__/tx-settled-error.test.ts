import { ErrorMessage, getErrorMessage } from 'utils/getErrorMessage';
import { TxSettledError } from 'modules/web3/utils/tx-settled-error';

// Post-settlement failures: the wrapped RPC error must not leak its own
// classification (e.g. a provider code) through to the user
describe('TxSettledError', () => {
  it('always resolves to the settled message, whatever the cause', () => {
    const causes = [
      new Error('timeout'),
      { code: -32603, message: 'Internal JSON-RPC error' },
      { code: 4001, message: 'User rejected the request' },
    ];
    for (const cause of causes) {
      expect(getErrorMessage(new TxSettledError(cause, '0xabc'))).toBe(
        ErrorMessage.TX_SETTLED_DATA_UNAVAILABLE,
      );
    }
  });
});
