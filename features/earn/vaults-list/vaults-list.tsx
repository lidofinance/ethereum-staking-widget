import type { FC } from 'react';

import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
} from 'shared/components';

import { VaultCardGGV } from '../vault-ggv';
import { VaultCardDVV } from '../vault-dvv';
import { VaultCardSTG } from '../vault-stg';

import { VaultsListWrapper } from './styles';
import { useVaultConfig } from '../shared/hooks/use-vault-config';
import { useEarnVaultsTvl } from 'shared/hooks/use-earn-vaults-tvl';
import { VaultCardSkeleton } from '../shared/vault-card-skeleton';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
  strategy: VaultCardSTG,
};

const getTvlSortFn = (tvlData?: Record<string, any>) => {
  if (tvlData && tvlData.data) {
    const { data } = tvlData;

    return (a: { name: string }, b: { name: string }) => {
      const tvlA = data[a.name]?.tvlEthWei
        ? BigInt(data[a.name].tvlEthWei)
        : BigInt(0);
      const tvlB = data[b.name]?.tvlEthWei
        ? BigInt(data[b.name].tvlEthWei)
        : BigInt(0);
      if (tvlA > tvlB) return -1;
      if (tvlA < tvlB) return 1;
      return 0;
    };
  } else {
    // No sorting as fallback
    return () => 0;
  }
};

export const EarnVaultsList: FC = () => {
  const { vaults } = useVaultConfig();
  const { data: tvlData, isLoading: isTvlLoading } = useEarnVaultsTvl();

  return (
    <>
      <VaultsListWrapper>
        {isTvlLoading
          ? vaults.map((_, index) => <VaultCardSkeleton key={index} />)
          : vaults.sort(getTvlSortFn(tvlData)).map((vault) => {
              const VaultCard = VAULT_CARDS[vault.name];
              return <VaultCard key={vault.name} />;
            })}
      </VaultsListWrapper>
      <DisclaimerSection>
        <AprDisclaimer mentionAPY />
        <LegalDisclaimer />
      </DisclaimerSection>
    </>
  );
};
