import invariant from 'tiny-invariant';

import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { getTokenDecimals } from 'utils/token-decimals';
import { getTokenIcon } from 'utils/get-token-icon';
import type { UsdVaultWithdrawClaimAmount } from '../../withdraw/claim-all-utils';
import { Amount, Amounts, TokenIcon } from './styles';

export const ClaimAmounts = ({
  amounts,
}: {
  amounts: UsdVaultWithdrawClaimAmount[];
}) => {
  // Contract: callers must aggregate claimable requests by payout token before
  // rendering this component, so the array contains at most one entry for each
  // token (currently USDC and USDT). This lets the token serve as a stable React
  // key. Keep this assertion at the component boundary to catch future callers
  // that accidentally pass unaggregated or otherwise duplicated token entries.
  invariant(
    new Set(amounts.map(({ token }) => token)).size === amounts.length,
    '[ClaimAmounts] tokens must be unique',
  );

  return (
    <Amounts>
      {amounts.map(({ amount, token }) => (
        <Amount key={token}>
          <TokenIcon>{getTokenIcon(token)}</TokenIcon>
          <TxAmount
            amount={amount}
            symbol={token}
            decimals={getTokenDecimals(token)}
          />
        </Amount>
      ))}
    </Amounts>
  );
};
