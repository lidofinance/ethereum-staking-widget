import { themeDark, Link } from '@lidofinance/lido-ui';
import {
  TokenMellowIcon,
  TokenObolIcon,
  TokenSsvIcon,
  TokenStethDarkIcon,
} from 'assets/earn';
import { FormatPercent } from 'shared/formatters';
import { useInpageNavigation } from 'providers/inpage-navigation';
import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_DVV_SLUG,
} from 'features/earn/consts';
import { useRouter } from 'next/router';

import { useDVVApr } from '../hooks/use-dvv-stats';
import { BreakdownContainer, BreakdownSection, BreakdownItem } from './styles';

export const DVVAprBreakdown = () => {
  const { navigateInpageAnchor } = useInpageNavigation();
  const router = useRouter();
  const { data } = useDVVApr();
  const ssvApr = data?.aprBreakdown.find((item) => item.id === 'ssv')?.value;
  const obolApr = data?.aprBreakdown.find((item) => item.id === 'obol')?.value;
  const stethApr = data?.aprBreakdown.find(
    (item) => item.id === 'steth',
  )?.value;
  const DVV_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;

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
        <span>
          <Link
            href={`${DVV_DEPOSIT_PATH}#what-is-apr-for-dvv`}
            target="_self"
            onClick={(e) => {
              // trigger smooth-scroll only if we are on the dvv deposit page
              if (router.asPath === DVV_DEPOSIT_PATH) {
                navigateInpageAnchor(e);
              }
            }}
          >
            Learn more in Lido DDV FAQ
          </Link>{' '}
        </span>
      </BreakdownSection>
    </BreakdownContainer>
  );
};
