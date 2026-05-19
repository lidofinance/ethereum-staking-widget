import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { STG_DEPOSIT_PATH } from 'features/earn/consts';
import { Container, Section } from './styles';

export const STGApyHint = () => {
  return (
    <Container>
      <Section>
        <span>
          {' '}
          7-day average APY after{' '}
          <LinkInpageAnchor pagePath={STG_DEPOSIT_PATH} hash="#deposit-fee">
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
          <LinkInpageAnchor
            pagePath={STG_DEPOSIT_PATH}
            hash="#what-is-apy-for-stg"
          >
            Learn more in Lido stRATEGY FAQ
          </LinkInpageAnchor>{' '}
        </span>
      </Section>
    </Container>
  );
};
