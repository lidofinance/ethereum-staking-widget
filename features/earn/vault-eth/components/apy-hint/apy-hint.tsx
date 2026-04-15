import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';
import { Container, Section } from './styles';
import { FAQ_IDS } from '../../faq/faq';

export const EthVaultApyHint = () => {
  return (
    <Container>
      <Section>
        <span>
          7-day average APY after{' '}
          <LinkInpageAnchor
            pagePath={ETH_DEPOSIT_PATH}
            hash={`#${FAQ_IDS.fees}`}
          >
            fees
          </LinkInpageAnchor>
        </span>
      </Section>
      <Section>
        APY is the annual percentage yield, denominated in ETH, including
        compounding and any current incentive rewards. Rates are not guaranteed
        and may change over time.
      </Section>

      <Section>
        <span>
          Learn more in{' '}
          <LinkInpageAnchor
            pagePath={ETH_DEPOSIT_PATH}
            hash={`#${FAQ_IDS.apy}`}
          >
            EarnETH FAQ
          </LinkInpageAnchor>
        </span>
      </Section>
    </Container>
  );
};
