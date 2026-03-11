import { FC } from 'react';

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
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import {
  UpgradeCardBlock,
  UpgradeContent,
  UpgradeHeader,
  UpgradeTitle,
  UpgradeSubtitle,
  UpgradeList,
  UpgradeItem,
  UpgradeItemIcon,
  UpgradeDescription,
  UpgradeIllustrationSlot,
  UpgradeButton,
} from './styles';
import { type Token } from 'consts/tokens';

type UpgradeCardProps = {
  setIsDrawerRightOpen: (isOpen: boolean) => void;
  vaultToken: Token;
};

export const UpgradeCardVaultPage: FC<UpgradeCardProps> = ({
  setIsDrawerRightOpen,
  vaultToken,
}) => {
  const { balances, isLoading } = useUpgradableTokenBalances();

  // prevents flashing the card content while loading the balances while pre-fetching the data (isLoading: false, balances undefined)
  if (Object.values(balances).some((b) => b === undefined) || isLoading)
    return null;

  const balance = balances[vaultToken as keyof typeof balances];
  const hasBalance = balance != null && balance > 0n;

  const CONTENT = hasBalance
    ? {
        title: 'Upgrade to EarnETH',
        subtitle:
          'Move your assets from Lido DVV, GGV or stRATEGY into the newest Lido vault',
        description: (
          <>
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
            >
              Learn how it works
            </ButtonInline>
          </>
        ),
        ctaText: 'Upgrade',
      }
    : {
        title: 'Explore EarnETH',
        subtitle:
          'Discover Lido’s newest ETH vault designed for optimized, automated yield',
        description: '',
        ctaText: 'Go to EarnETH',
      };

  return (
    <UpgradeCardBlock>
      <UpgradeContent
        $altLayout={hasBalance}
        $hasDescription={!!CONTENT.description}
      >
        <UpgradeHeader>
          <UpgradeTitle>{CONTENT.title}</UpgradeTitle>
          <UpgradeSubtitle>{CONTENT.subtitle}</UpgradeSubtitle>
        </UpgradeHeader>
        <UpgradeList>
          <UpgradeItem>
            <UpgradeItemIcon aria-hidden>
              <IconChartPie width={20} height={20} />
            </UpgradeItemIcon>
            <span>Auto-allocation across Lido&apos;s best ETH strategies</span>
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
        {CONTENT.description && (
          <UpgradeDescription>{CONTENT.description}</UpgradeDescription>
        )}
        <UpgradeIllustrationSlot>
          <UpgradeIllustrationIcon width="142px" height="230px" />
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
        >
          {CONTENT.ctaText}
        </UpgradeButton>
      </LocalLink>
    </UpgradeCardBlock>
  );
};
