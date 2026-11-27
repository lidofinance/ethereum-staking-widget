import { TOKEN_SYMBOLS } from 'consts/tokens';

import { GeoNotice } from '../../shared/geo-notice';
import { VaultSidePanel } from '../../shared/vault-page';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
  ETH_DEPOSIT_PATH,
  ETH_WITHDRAW_PATH,
} from '../../consts';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { EthVaultDepositForm } from '../deposit';
import { EthVaultWithdrawForm } from '../withdraw';
import { UpgradeAssetsBlock } from '../upgrade-assets/upgrade-assets';
import { useEthVaultApy } from '../hooks/use-vault-apy';
import { useEthVaultPosition } from '../hooks/use-position';
import { ETH_VAULT_TOKEN_SYMBOL } from '../consts';

const ROUTES = {
  [EARN_VAULT_DEPOSIT_SLUG]: ETH_DEPOSIT_PATH,
  [EARN_VAULT_WITHDRAW_SLUG]: ETH_WITHDRAW_PATH,
};

const MATOMO = {
  [EARN_VAULT_DEPOSIT_SLUG]: MATOMO_EARN_EVENTS_TYPES.earnEthDepositTab,
  [EARN_VAULT_WITHDRAW_SLUG]: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalTab,
};

type EthVaultPositionManagerProps = {
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
};

export const EthVaultPositionManager = ({
  action,
}: EthVaultPositionManagerProps) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const { apy, isLoading: isApyLoading } = useEthVaultApy();
  const { data, isLoading, ethAmount, usdBalance } = useEthVaultPosition();

  return (
    <VaultSidePanel
      variant="eth"
      action={action}
      routes={ROUTES}
      matomo={MATOMO}
      apx={apy}
      isApxLoading={isApyLoading}
      position={{
        amount: ethAmount,
        symbol: TOKEN_SYMBOLS.eth,
        sharesAmount: data?.earnethSharesBalance,
        sharesSymbol: ETH_VAULT_TOKEN_SYMBOL,
        usdAmount: usdBalance,
        isLoading,
      }}
      notice={isDeposit && <GeoNotice />}
      before={<UpgradeAssetsBlock />}
    >
      {isDeposit ? <EthVaultDepositForm /> : <EthVaultWithdrawForm />}
    </VaultSidePanel>
  );
};
