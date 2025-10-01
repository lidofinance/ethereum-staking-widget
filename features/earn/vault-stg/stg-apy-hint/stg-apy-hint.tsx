import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { STG_DEPOSIT_PATH } from 'features/earn/consts';
import { TokenMellowIcon } from 'assets/earn';
import { Container, Section, Item } from './styles';
import { STG_MELLOW_POINTS_BORDER_DATE_FORMATTED } from '../consts';

export const STGApyHint = () => {
  return (
    <Container>
      <Section>
        <span>
          {' '}
          7-day average APR after{' '}
          <LinkInpageAnchor pagePath={STG_DEPOSIT_PATH} hash="#deposit-fee">
            fees
          </LinkInpageAnchor>
        </span>
      </Section>
      <Section>
        APY is the annual percentage yield including compounding
      </Section>
      <Section>
        Points{' '}
        <Item>
          <TokenMellowIcon width={24} height={24} viewBox="0 0 28 28" />{' '}
          <b>Mellow</b>
        </Item>
        <Item>
          <span>
            <b>Before {STG_MELLOW_POINTS_BORDER_DATE_FORMATTED}:</b>
            <br />
            0.00075 points per hour per $1
          </span>
        </Item>
        <Item>
          <span>
            <b>After {STG_MELLOW_POINTS_BORDER_DATE_FORMATTED}:</b>
            <br />
            0.00025 points per hour per $1
          </span>
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
