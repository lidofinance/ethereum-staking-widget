import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { getTokenDecimals } from 'utils/token-decimals';
import { getTokenIcon } from 'utils/get-token-icon';
import type { UsdVaultWithdrawClaimAmount } from '../../withdraw/claim-all-utils';
import { Amount, Amounts, TokenIcon } from './styles';

export const ClaimAmounts = ({
  amounts,
}: {
  amounts: UsdVaultWithdrawClaimAmount[];
}) => (
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
