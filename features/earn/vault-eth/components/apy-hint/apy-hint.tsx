import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { Container, Section } from './styles';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';

export const EthVaultApyHint = () => {
  return (
    <Container>
      <Section>
        <span>7-day average APY after fees</span>
      </Section>
      <Section>
        APY is the annual percentage yield including compounding. APY includes
        compounding and any current incentive rewards. Rates are not guaranteed
        and may change over time.
      </Section>

      <Section>
        <span>
          Learn more in{' '}
          <LinkInpageAnchor pagePath={ETH_DEPOSIT_PATH} hash="#earneth-apy">
            EarnETH FAQ
          </LinkInpageAnchor>
        </span>
      </Section>
    </Container>
  );
};
