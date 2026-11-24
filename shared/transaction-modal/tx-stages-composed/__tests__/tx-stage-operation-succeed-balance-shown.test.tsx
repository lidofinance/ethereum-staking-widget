import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TxStageOperationSucceedBalanceShown } from '../tx-stage-operation-succeed-balance-shown';

// only the title this component composes is under test: the modal shell, the
// amount formatter and the add-token button are replaced with plain markup
vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ walletChainId: 1 }),
}));
vi.mock('shared/hooks/use-token-address', () => ({
  useTokenAddress: () => '0xToken',
}));
vi.mock('../../tx-stages-basic', () => ({
  TxStageSuccess: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));
vi.mock('../../tx-stages-parts/success-text', () => ({
  SuccessText: () => null,
}));
vi.mock('../../tx-stages-parts/tx-amount', () => ({
  TxAmount: ({ amount, symbol }: { amount: bigint; symbol: string }) => (
    <b>
      {String(amount)} {symbol}
    </b>
  ),
}));
vi.mock('../../../components', () => ({
  TokenToWallet: () => <button data-testid="txSuccessAddToken" />,
}));

const render = (balance: bigint | undefined) => {
  const html = renderToStaticMarkup(
    <TxStageOperationSucceedBalanceShown
      balance={balance}
      balanceToken="wstETH"
      operationText="Staking"
    />,
  );
  // text content only, React's comment markers between text nodes dropped
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { html, text };
};

describe('TxStageOperationSucceedBalanceShown', () => {
  it('shows the new balance', () => {
    const { text } = render(123n);

    expect(text).toBe('Your new balance is 123 wstETH');
  });

  it('shows a zero balance as a balance, not as a missing one', () => {
    const { text } = render(0n);

    expect(text).toBe('Your new balance is 0 wstETH');
  });

  it('drops the amount when the balance is missing', () => {
    const { text } = render(undefined);

    expect(text).toBe('Your wstETH balance was updated');
  });

  it.each([123n, 0n, undefined])(
    'keeps the add-token button for a balance of %s',
    (balance) => {
      const { html } = render(balance);

      expect(html).toContain('data-testid="txSuccessAddToken"');
    },
  );
});
