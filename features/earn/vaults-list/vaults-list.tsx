import type { FC } from 'react';

import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
} from 'shared/components';
import { useEarnVaultsTvl } from 'shared/hooks/use-earn-vaults-tvl';

import { VaultCardGGV } from '../vault-ggv';
import { VaultCardDVV } from '../vault-dvv';
import { VaultCardSTG } from '../vault-stg';
import { VaultCardSkeleton } from '../shared/vault-card-skeleton';
import { useEarnState } from '../shared/hooks/use-earn-state';

import { VaultsListWrapper } from './styles';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
  strategy: VaultCardSTG,
};

const getTvlSortFn = (tvlData?: Record<string, any>) => {
  if (tvlData && tvlData.data) {
    const { data } = tvlData;

    return (a: { name: string }, b: { name: string }) => {
      const tvlA = BigInt(data[a.name]?.tvlEthWei ?? 0n);
      const tvlB = BigInt(data[b.name]?.tvlEthWei ?? 0n);
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
  const { earnVaultsEnabled } = useEarnState();
  const { data: tvlData, isLoading: isTvlLoading } = useEarnVaultsTvl();

  return (
    <>
      <VaultsListWrapper>
        {isTvlLoading
          ? earnVaultsEnabled.map((_, index) => (
              <VaultCardSkeleton key={index} />
            ))
          : earnVaultsEnabled.sort(getTvlSortFn(tvlData)).map((vault) => {
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
