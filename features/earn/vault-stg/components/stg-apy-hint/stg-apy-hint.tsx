import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { STG_DEPOSIT_PATH } from 'features/earn/consts';
import { TokenMellowIcon } from 'assets/earn';
import { Container, Section, Item } from './styles';

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
        <Item>
          <TokenMellowIcon width={24} height={24} viewBox="0 0 28 28" />{' '}
          <b>Mellow Points</b>
        </Item>
        <Item>
          <span>0.00025 points per hour per $1</span>
        </Item>
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
