import { useThemeToggle } from '@lidofinance/lido-ui';

import { BannerLinkButton } from '../banner-link-button';
import { Wrap, Title, Description, Footer, Logos } from './styles';

import { ReactComponent as IconGauntletDark } from 'assets/vault-banner/icon-gauntlet-dark.svg';
import { ReactComponent as IconP2PDark } from 'assets/vault-banner/icon-p2p-dark.svg';
import { ReactComponent as IconRe7Dark } from 'assets/vault-banner/icon-re7-dark.svg';
import { ReactComponent as IconStakehouseDark } from 'assets/vault-banner/icon-stakehouse-dark.svg';

import { ReactComponent as IconGauntletLight } from 'assets/vault-banner/icon-gauntlet-light.svg';
import { ReactComponent as IconP2PLight } from 'assets/vault-banner/icon-p2p-light.svg';
import { ReactComponent as IconRe7Light } from 'assets/vault-banner/icon-re7-light.svg';
import { ReactComponent as IconStakehouseLight } from 'assets/vault-banner/icon-stakehouse-light.svg';

import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

const LINK_LEARN_MORE = 'https://lido.fi/#defi-strategies';

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.vaultsBannerLearnMore);

export const VaultsBannerInfo = () => {
  const { themeName } = useThemeToggle();
  return (
    <Wrap>
      <Title>Get more with restaking vaults</Title>
      <Description>
        Use stETH to unlock restaking rewards through the best-in-class
        opinionated curated vaults
      </Description>
      <Footer>
        <Logos>
          {themeName === 'dark' ? <IconP2PDark /> : <IconP2PLight />}
          {themeName === 'dark' ? (
            <IconStakehouseDark />
          ) : (
            <IconStakehouseLight />
          )}
          {themeName === 'dark' ? <IconRe7Dark /> : <IconRe7Light />}
          {themeName === 'dark' ? <IconGauntletDark /> : <IconGauntletLight />}
        </Logos>
        <BannerLinkButton href={LINK_LEARN_MORE} onClick={linkClickHandler}>
          Learn more
        </BannerLinkButton>
      </Footer>
    </Wrap>
  );
};
