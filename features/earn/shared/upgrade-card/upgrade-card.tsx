import { FC } from 'react';
import { Deposit, History, Stake } from '@lidofinance/lido-ui';

import { useDappStatus } from 'modules/web3';
import { UpgradeIllustrationIcon } from 'assets/earn-v2';
import { ButtonInline } from 'shared/components/button-inline/button-inline';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';

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
import { LocalLink } from 'shared/components/local-link';

type UpgradeCardProps = {
  setIsDrawerRightOpen: (isOpen: boolean) => void;
};

export const UpgradeCard: FC<UpgradeCardProps> = ({ setIsDrawerRightOpen }) => {
  const { isWalletConnected } = useDappStatus();

  // TODO; check assets available to upgrade
  if (!isWalletConnected) return null;

  return (
    <UpgradeCardBlock>
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
                <Deposit width={18} height={18} />
              </UpgradeItemIcon>
              <span>Auto-allocation across Lido’s best ETH strategies</span>
            </UpgradeItem>
            <UpgradeItem>
              <UpgradeItemIcon aria-hidden>
                <Stake width={18} height={18} />
              </UpgradeItemIcon>
              <span>No unstaking. Rewards keep accruing</span>
            </UpgradeItem>
            <UpgradeItem>
              <UpgradeItemIcon aria-hidden>
                <History width={18} height={18} />
              </UpgradeItemIcon>
              <span>Up to date with new strategies</span>
            </UpgradeItem>
          </UpgradeList>
          <UpgradeParagraph>
            To upgrade you just need to deposit your upgradable tokens into the
            EarnETH Vault and you’ll receive a new earnETH token representing
            your position in Lido ETH Growth.{' '}
            <ButtonInline
              onClick={(event) => {
                event.preventDefault();
                setIsDrawerRightOpen(true);
              }}
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
        <UpgradeButton size="lg" fullwidth>
          Upgrade
        </UpgradeButton>
      </LocalLink>
    </UpgradeCardBlock>
  );
};
