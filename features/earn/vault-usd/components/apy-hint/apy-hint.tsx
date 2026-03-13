import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { USD_DEPOSIT_PATH } from 'features/earn/consts';
import { Container, Section } from './styles';
import { FAQ_IDS } from '../../faq/faq';

export const UsdVaultApyHint = () => {
  return (
    <Container>
      <Section>
        <span>
          7-day average APY after{' '}
          <LinkInpageAnchor
            pagePath={USD_DEPOSIT_PATH}
            hash={`#${FAQ_IDS.fees}`}
          >
            fees
          </LinkInpageAnchor>
        </span>
      </Section>
      <Section>
        APY is the annual percentage yield including compounding. APY includes
        compounding and any current incentive rewards. Rates are not guaranteed
        and may change over time.
      </Section>

      <Section>
        <span>
          Learn more in{' '}
          <LinkInpageAnchor
            pagePath={USD_DEPOSIT_PATH}
            hash={`#${FAQ_IDS.apy}`}
          >
            EarnUSD FAQ
          </LinkInpageAnchor>
        </span>
      </Section>
    </Container>
  );
};
