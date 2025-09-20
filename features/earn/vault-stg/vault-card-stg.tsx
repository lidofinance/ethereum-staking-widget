import {
  TokenEthIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultSTGIcon,
  TokenStrethIcon,
} from 'assets/earn';

import { useDappStatus } from 'modules/web3';

import { VaultCard } from '../shared/vault-card';
import { useGGVStats as usePlaceholderStats } from '../vault-ggv/hooks/use-ggv-stats';
import { useGGVPosition as usePlaceholderPosition } from '../vault-ggv/hooks/use-ggv-position';
import {
  STG_VAULT_DESCRIPTION,
  STG_PARTNERS,
  STG_TOKEN_SYMBOL,
} from './consts';

export const VaultCardSTG = () => {
  const { isWalletConnected } = useDappStatus();
  // reuse placeholder hooks until STG-specific hooks are implemented
  const { tvl, apy, isLoading: isLoadingStats } = usePlaceholderStats();
  const { sharesBalance, isLoading: isLoadingPosition } =
    usePlaceholderPosition();

  return (
    <VaultCard
      title="stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={'stg'}
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
        isLoading: isLoadingStats,
      }}
      logo={<VaultSTGIcon />}
    />
  );
};
