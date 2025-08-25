/* ============================================================
 * 🚫 NOTICE 🚫
 * ------------------------------------------------------------
 * This banner is not used since the Earn page release.
 * ============================================================
 */

import { useThemeToggle } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { ReactComponent as IconMevDark } from 'assets/vault-banner/icon-mev-dark.svg';
import { ReactComponent as IconP2PDark } from 'assets/vault-banner/icon-p2p-dark.svg';
import { ReactComponent as IconRe7Dark } from 'assets/vault-banner/icon-re7-dark.svg';
import { ReactComponent as IconStakehouseDark } from 'assets/vault-banner/icon-stakehouse-dark.svg';

import { ReactComponent as IconMevLight } from 'assets/vault-banner/icon-mev-light.svg';
import { ReactComponent as IconP2PLight } from 'assets/vault-banner/icon-p2p-light.svg';
import { ReactComponent as IconRe7Light } from 'assets/vault-banner/icon-re7-light.svg';
import { ReactComponent as IconStakehouseLight } from 'assets/vault-banner/icon-stakehouse-light.svg';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo';

import { BannerLinkButton } from '../banner-link-button';
import { BannerWrap } from '../shared-banner-partials';
import { Title, Description, Footer, Logos } from './styles';

const LINK_LEARN_MORE = `${config.rootOrigin}/steth-in-defi`;

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.vaultsBannerLearnMore);

type VaultsBannerInfoProps = {
  isTitleCompact?: boolean;
  showLearnMoreButton?: boolean;
};

export const VaultsBannerInfo = ({
  isTitleCompact,
  showLearnMoreButton = true,
}: VaultsBannerInfoProps) => {
  const { themeName } = useThemeToggle();
  return (
    <BannerWrap>
      <Title isCompact={isTitleCompact}>
        Explore and participate in DeFi strategies
      </Title>
      <Description>
        Use stETH to unlock rewards through a set of carefully curated vaults
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
          {themeName === 'dark' ? <IconMevDark /> : <IconMevLight />}
        </Logos>
        {showLearnMoreButton && (
          <BannerLinkButton href={LINK_LEARN_MORE} onClick={linkClickHandler}>
            Learn more
          </BannerLinkButton>
        )}
      </Footer>
    </BannerWrap>
  );
};
