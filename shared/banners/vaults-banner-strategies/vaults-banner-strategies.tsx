import { Button, Link } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { ReactComponent as IconStakehouse } from 'assets/vault-banner/strategy-stakehouse.svg';
import { ReactComponent as SymbolPlus } from 'assets/vault-banner/symbol-plus.svg';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

import {
  Wrap,
  Header,
  Icon,
  Title,
  TitleText,
  TitleDescription,
  Strategies,
  StrategyItem,
  StrategyDivider,
} from './styles';

const LINK_LEARN_MORE = `${config.rootOrigin}/#defi-strategies`;

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.vaultsBannerExploreAll);

export const VaultsBannerStrategies = () => {
  const divider = (
    <StrategyDivider>
      <SymbolPlus />
    </StrategyDivider>
  );
  return (
    <>
      <Wrap>
        <Header>
          <Icon>
            <IconStakehouse />
          </Icon>
          <Title>
            <TitleText>Restaking Vault</TitleText>
            <TitleDescription>Curated by Steakhouse Financial</TitleDescription>
          </Title>
        </Header>
        <Strategies>
          <StrategyItem>
            <b>stETH</b>
            <br /> APR
          </StrategyItem>

          {divider}

          <StrategyItem>
            <b>Symbiotic</b>
            <br /> Points
          </StrategyItem>

          {divider}

          <StrategyItem>
            <b>Mellow</b>
            <br /> Points
          </StrategyItem>

          {divider}

          <StrategyItem>
            <b>Restaking</b>
            <br /> <b>APR</b> TBD
          </StrategyItem>
        </Strategies>
      </Wrap>
      <Link href={LINK_LEARN_MORE}>
        <Button size="sm" fullwidth onClick={linkClickHandler}>
          Explore all strategies
        </Button>
      </Link>
    </>
  );
};
