import { themeDark } from '@lidofinance/lido-ui';
import {
  TokenMellowIcon,
  TokenObolIcon,
  TokenSsvIcon,
  TokenStethDarkIcon,
} from 'assets/earn';
import { useDVVApr } from '../hooks/use-dvv-stats';

import { BreakdownContainer, BreakdownSection, BreakdownItem } from './styles';
import { FormatPercent } from 'shared/formatters';

export const DVVAprBreakdown = () => {
  const { data } = useDVVApr();
  const ssvApr = data?.aprBreakdown.find((item) => item.id === 'ssv')?.value;
  const obolApr = data?.aprBreakdown.find((item) => item.id === 'obol')?.value;
  const stethApr = data?.aprBreakdown.find(
    (item) => item.id === 'steth',
  )?.value;

  return (
    <BreakdownContainer>
      <BreakdownSection>
        APR
        <BreakdownItem>
          <TokenSsvIcon
            theme={themeDark}
            width={24}
            height={24}
            viewBox="0 0 28 28"
          />{' '}
          <b>SSV Incentives</b>{' '}
          <FormatPercent value={ssvApr} decimals="percent" />
        </BreakdownItem>
        <BreakdownItem>
          <TokenObolIcon
            theme={themeDark}
            width={24}
            height={24}
            viewBox="0 0 28 28"
          />{' '}
          <b>Obol Incentives</b>{' '}
          <FormatPercent value={obolApr} decimals="percent" />
        </BreakdownItem>
        <BreakdownItem>
          <TokenStethDarkIcon width={24} height={24} viewBox="0 0 24 24" />{' '}
          <b>Lido Staking APR</b>{' '}
          <FormatPercent value={stethApr} decimals="percent" />
        </BreakdownItem>
      </BreakdownSection>
      <BreakdownSection>
        Points
        <BreakdownItem>
          <TokenMellowIcon width={24} height={24} viewBox="0 0 28 28" />{' '}
          <b>Mellow</b> <span>0.00025 per hour per $1</span>
        </BreakdownItem>
      </BreakdownSection>
      <BreakdownSection>
        You can find more details in the FAQ below.
      </BreakdownSection>
    </BreakdownContainer>
  );
};
