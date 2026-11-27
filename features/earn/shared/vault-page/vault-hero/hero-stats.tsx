import { Typography } from '@lidofinance/lido-app-ui';

import { FormatLargeAmount } from 'shared/formatters/format-large-amount';

import { DEFAULT_APX_LABEL, type VaultApx, type VaultTvl } from '../types';
import { HeroStat, HeroStatsRow } from './styles';
import { VaultApxValue } from './vault-apx-value';

type HeroStatsProps = {
  apx: VaultApx;
  tvl: VaultTvl;
};

export const HeroStats = ({ apx, tvl }: HeroStatsProps) => (
  <HeroStatsRow>
    <HeroStat
      align="left"
      size="small"
      label={apx.label ?? DEFAULT_APX_LABEL}
      info={apx.hint}
      loading={apx.isLoading}
      dataTestId={{ root: 'apx', label: 'apx-label' }}
      value={
        <Typography
          as="div"
          variant="h3"
          weight="bold"
          color={apx.isStale ? 'secondary' : 'success'}
          data-testid="apx-value"
        >
          <VaultApxValue apx={apx} />
        </Typography>
      }
    />
    <HeroStat
      align="left"
      size="small"
      label="TVL"
      loading={tvl.isLoading}
      dataTestId={{ root: 'tvl', label: 'tvl-label' }}
      value={
        <Typography as="div" variant="h3" data-testid="tvl-amount">
          <FormatLargeAmount amount={tvl.value} />
        </Typography>
      }
    />
  </HeroStatsRow>
);
