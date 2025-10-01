import {
  TokenEthIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultSTGIcon,
  TokenStrethIcon,
} from 'assets/earn';

import { useDappStatus } from 'modules/web3';
import { useSTGStats } from './hooks/use-stg-stats';
import { useSTGPosition } from './hooks/use-stg-position';
import { VaultCard } from '../shared/vault-card';
import { EARN_VAULT_STG_SLUG } from '../consts';
import {
  STG_VAULT_DESCRIPTION,
  STG_PARTNERS,
  STG_TOKEN_SYMBOL,
} from './consts';
import { STGApyHint } from './stg-apy-hint/stg-apy-hint';

export const VaultCardSTG = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apy, isLoading: isLoadingStats } = useSTGStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useSTGPosition();

  return (
    <VaultCard
      title="Lido stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_STG_SLUG}
      partners={STG_PARTNERS}
      tokens={[
        { name: 'ETH', logo: <TokenEthIcon /> },
        { name: 'WETH', logo: <TokenWethIcon /> },
        { name: 'wstETH', logo: <TokenWstethIcon /> },
      ]}
      position={
        isWalletConnected
          ? {
              balance: sharesBalance,
              symbol: STG_TOKEN_SYMBOL,
              isLoading: isLoadingPosition,
              logo: <TokenStrethIcon width={16} height={16} />,
            }
          : undefined
      }
      stats={{
        tvl,
        apx: apy,
        apxLabel: 'APY',
        apxHint: <STGApyHint />,
        isLoading: isLoadingStats,
      }}
      logo={<VaultSTGIcon />}
    />
  );
};
