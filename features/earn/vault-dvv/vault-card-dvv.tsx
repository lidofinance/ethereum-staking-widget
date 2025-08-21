import {
  PartnerStakehouseIcon,
  TokenEthIcon,
  TokenWethIcon,
  VaultDDVIcon,
} from 'assets/earn';
import { useDappStatus } from 'modules/web3';

import { VaultCard } from '../shared/vault-card';
import { EARN_VAULT_DVV_SLUG } from '../consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { useDVVStats } from './hooks/use-dvv-stats';
import { useDVVPosition } from './hooks/use-dvv-position';
import { DVV_TOKEN_SYMBOL } from './consts';

export const VaultCardDVV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apr, isLoading: isLoadingStats } = useDVVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useDVVPosition();
  return (
    <VaultCard
      title="Lido DVV"
      description="The Decentralized Validator Vault accepts ETH deposits to the Lido protocol, accelerating the adoption of Distributed Validator Technology (DVT)"
      urlSlug={EARN_VAULT_DVV_SLUG}
      partners={[
        {
          role: 'Curated by',
          icon: <PartnerStakehouseIcon />,
          text: 'Stakehouse Financial',
        },
      ]}
      tokens={[
        { name: 'ETH', logo: <TokenEthIcon /> },
        { name: 'WETH', logo: <TokenWethIcon /> },
      ]}
      stats={{ tvl, apr, isLoading: isLoadingStats }}
      logo={<VaultDDVIcon />}
      position={
        isWalletConnected
          ? {
              symbol: DVV_TOKEN_SYMBOL,
              balance: sharesBalance,
              isLoading: isLoadingPosition,
            }
          : undefined
      }
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvDeposit);
      }}
    />
  );
};
