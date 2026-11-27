import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKEN_SYMBOLS } from 'consts/tokens';

import { GeoNotice } from '../../shared/geo-notice';
import { VaultSidePanel } from '../../shared/vault-page';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
  USD_DEPOSIT_PATH,
  USD_WITHDRAW_PATH,
} from '../../consts';

import { UsdVaultDepositForm } from '../deposit/deposit-form';
import { UsdVaultWithdrawForm } from '../withdraw/withdraw-form';
import { useUsdVaultApy } from '../hooks/use-vault-apy';
import { useUsdVaultPosition } from '../hooks/use-position';
import { USD_VAULT_TOKEN_SYMBOL } from '../consts';

const ROUTES = {
  [EARN_VAULT_DEPOSIT_SLUG]: USD_DEPOSIT_PATH,
  [EARN_VAULT_WITHDRAW_SLUG]: USD_WITHDRAW_PATH,
};

const MATOMO = {
  [EARN_VAULT_DEPOSIT_SLUG]: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositTab,
  [EARN_VAULT_WITHDRAW_SLUG]: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalTab,
};

type UsdVaultPositionManagerProps = {
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
};

export const UsdVaultPositionManager = ({
  action,
}: UsdVaultPositionManagerProps) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const { apy, isLoading: isApyLoading } = useUsdVaultApy();
  const { earnusdSharesBalance, isLoading, usdcAmount } = useUsdVaultPosition();

  return (
    <VaultSidePanel
      variant="usd"
      action={action}
      routes={ROUTES}
      matomo={MATOMO}
      apx={apy}
      isApxLoading={isApyLoading}
      position={{
        // USDC is already a dollar amount, so no extra USD line
        amount: usdcAmount,
        symbol: TOKEN_SYMBOLS.usdc,
        sharesAmount: earnusdSharesBalance,
        sharesSymbol: USD_VAULT_TOKEN_SYMBOL,
        isLoading,
      }}
      notice={isDeposit && <GeoNotice />}
    >
      {isDeposit ? <UsdVaultDepositForm /> : <UsdVaultWithdrawForm />}
    </VaultSidePanel>
  );
};
