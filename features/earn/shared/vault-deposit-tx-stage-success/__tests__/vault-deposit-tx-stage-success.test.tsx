import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VaultDepositTxStageSuccess } from '../vault-deposit-tx-stage-success';

// only the title this component composes is under test
vi.mock('shared/transaction-modal/tx-stages-basic/tx-stage-success', () => ({
  TxStageSuccess: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));
vi.mock('shared/transaction-modal/tx-stages-parts/tx-amount', () => ({
  TxAmount: ({ amount, symbol }: { amount: bigint; symbol: string }) => (
    <b>
      {String(amount)} {symbol}
    </b>
  ),
}));

const render = (newBalance: bigint | undefined) =>
  renderToStaticMarkup(
    <VaultDepositTxStageSuccess
      newBalance={newBalance}
      balanceSymbol="DVstETH"
      description="Depositing operation was successful"
    />,
  )
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('VaultDepositTxStageSuccess', () => {
  it('shows the new balance', () => {
    expect(render(123n)).toBe('Your new balance is 123 DVstETH');
  });

  it('shows a zero balance as a balance, not as a missing one', () => {
    expect(render(0n)).toBe('Your new balance is 0 DVstETH');
  });

  it('drops the amount when the balance is missing', () => {
    expect(render(undefined)).toBe('Your DVstETH balance was updated');
  });
});
