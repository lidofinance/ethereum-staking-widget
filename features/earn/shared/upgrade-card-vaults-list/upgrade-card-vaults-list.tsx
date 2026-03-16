import { FC } from 'react';

import { useDappStatus } from 'modules/web3';
import {
  UpgradeIllustrationIcon,
  IconChartColumnIncreasing,
  IconChartPie,
  IconRotateCw,
} from 'assets/earn-v2';
import { ButtonInline } from 'shared/components/button-inline/button-inline';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';
import { LocalLink } from 'shared/components/local-link';
import { useUpgradableTokenBalances } from 'features/earn/vault-eth/upgrade-assets/use-upgradable-token-balances';
import { ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE } from 'features/earn/vault-eth/consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import {
  UpgradeCardBlock,
  UpgradeContent,
  UpgradeTitle,
  UpgradeList,
  UpgradeItem,
  UpgradeItemIcon,
  UpgradeParagraph,
  UpgradeIllustrationSlot,
  UpgradeColumn,
  UpgradeButton,
} from './styles';

type UpgradeCardProps = {
  setIsDrawerRightOpen: (isOpen: boolean) => void;
};

export const UpgradeCardVaultsList: FC<UpgradeCardProps> = ({
  setIsDrawerRightOpen,
}) => {
  const { isWalletConnected } = useDappStatus();
  const { balances } = useUpgradableTokenBalances();

  if (!isWalletConnected) return null;

  const hasBalance = (token: keyof typeof balances) =>
    balances[token] != null && balances[token] > 0n;

  const upgradableTokens =
    ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE.filter(hasBalance);

  if (upgradableTokens.length === 0) return null;

  return (
    <UpgradeCardBlock data-testid={'upgradeCardBlock'}>
      <UpgradeContent>
        <UpgradeColumn>
          <UpgradeTitle>Upgrade your tokens</UpgradeTitle>
          <span>
            Lido DeFi vaults have been live and tested for 6 months. Today they
            get a major upgrade. Instead of picking which curator or strategy
            you prefer, the new EarnETH vault aggregates the winning curator on
            your behalf.
          </span>
          <UpgradeList>
            <UpgradeItem>
              <UpgradeItemIcon aria-hidden>
                <IconChartPie width={20} height={20} />
              </UpgradeItemIcon>
              <span>
                Auto-allocation across Lido&apos;s best ETH strategies
              </span>
            </UpgradeItem>
            <UpgradeItem>
              <UpgradeItemIcon aria-hidden>
                <IconChartColumnIncreasing width={20} height={20} />
              </UpgradeItemIcon>
              <span>No unstaking. Rewards keep accruing</span>
            </UpgradeItem>
            <UpgradeItem>
              <UpgradeItemIcon aria-hidden>
                <IconRotateCw width={20} height={20} />
              </UpgradeItemIcon>
              <span>Up to date with new strategies</span>
            </UpgradeItem>
          </UpgradeList>
          <UpgradeParagraph>
            To upgrade you just need to deposit your upgradable tokens into the
            EarnETH Vault and you&apos;ll receive a new earnETH token
            representing your position in EarnETH.{' '}
            <ButtonInline
              onClick={(event) => {
                event.preventDefault();
                trackMatomoEvent(
                  MATOMO_EARN_EVENTS_TYPES.earnListEarnEthBannerLearnHowItWorks,
                );
                setIsDrawerRightOpen(true);
              }}
              data-testid={'howItWorksButton'}
            >
              Learn how it works
            </ButtonInline>
          </UpgradeParagraph>
        </UpgradeColumn>
        <UpgradeIllustrationSlot>
          <UpgradeIllustrationIcon />
        </UpgradeIllustrationSlot>
      </UpgradeContent>

      <LocalLink href={ETH_DEPOSIT_PATH}>
        <UpgradeButton
          size="lg"
          fullwidth
          onClick={() =>
            trackMatomoEvent(
              MATOMO_EARN_EVENTS_TYPES.earnListEarnEthBannerUpgrade,
            )
          }
          data-testid={'upgradeButton'}
        >
          Upgrade
        </UpgradeButton>
      </LocalLink>
    </UpgradeCardBlock>
  );
};
