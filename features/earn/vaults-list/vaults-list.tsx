import type { FC } from 'react';

import { VaultCardGGV } from '../vault-ggv';
import { VaultCardDVV } from '../vault-dvv';

import { VaultsListWrapper } from './styles';

export const EarnVaultsList: FC = () => {
  return (
    <VaultsListWrapper>
      <VaultCardGGV />
      <VaultCardDVV />
    </VaultsListWrapper>
  );
};
