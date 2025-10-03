import { themeDark } from '@lidofinance/lido-ui';

import {
  TokenMellowIcon,
  TokenObolIcon,
  TokenSsvIcon,
  TokenStethDarkIcon,
} from 'assets/earn';
import { FormatPercent } from 'shared/formatters';
import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { DVV_DEPOSIT_PATH } from 'features/earn/consts';

import { useDVVApr } from '../hooks/use-dvv-stats';
import { BreakdownContainer, BreakdownSection, BreakdownItem } from './styles';

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
        <span>
          7-day average APR after{' '}
          <LinkInpageAnchor pagePath={DVV_DEPOSIT_PATH} hash="#deposit-fee">
            fees
          </LinkInpageAnchor>
        </span>
      </BreakdownSection>
      <BreakdownSection>
        APR is the annual percentage rate without compounding
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
        <span>
          <LinkInpageAnchor
            pagePath={DVV_DEPOSIT_PATH}
            hash="#what-is-apr-for-dvv"
          >
            Learn more in Lido DVV FAQ
          </LinkInpageAnchor>{' '}
        </span>
      </BreakdownSection>
    </BreakdownContainer>
  );
};
