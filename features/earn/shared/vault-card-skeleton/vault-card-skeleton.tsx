import { InlineLoader, Button } from '@lidofinance/lido-ui';
import { VaultCardWrapper } from '../vault-card/styles';
import { VaultStats } from '../vault-stats';
import { VaultTokensLabel } from '../vault-description/styles';
import { FullWidthLoader } from './styles';

export const VaultCardSkeleton = () => {
  return (
    <VaultCardWrapper>
      <FullWidthLoader />
      <VaultStats isLoading apxLabel="APY" />
      <FullWidthLoader $height="40px" />
      <VaultTokensLabel>
        Deposit tokens <InlineLoader style={{ width: '70px' }} />
      </VaultTokensLabel>
      <Button fullwidth size="sm" disabled>
        Deposit
      </Button>
    </VaultCardWrapper>
  );
};
