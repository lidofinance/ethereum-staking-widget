import { FC } from 'react';
import { Deposit, History, Link, Stake } from '@lidofinance/lido-ui';
import { useDappStatus } from 'modules/web3';
import { UpgradeIllustrationIcon } from 'assets/earn-new';

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

export const UpgradeCard: FC<UpgradeCardProps> = ({ setIsDrawerRightOpen }) => {
  const { isWalletConnected } = useDappStatus();

  // TODO; check assets available to upgrade
  if (!isWalletConnected) return null;

  return (
    <UpgradeCardBlock>
      <UpgradeContent>
        <UpgradeColumn>
          <UpgradeTitle>Upgrade to Lido Earn ETH</UpgradeTitle>
          <span>
            Move your assets from Lido DVV, GGV or stRATEGY into the upgraded
            Lido vault
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
            To upgrade, simply deposit your GG share token into the Lido Earn
            ETH Vault. You’ll receive a new token representing your share.{' '}
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault();
                // TODO: wire to "Learn how it works" page
              }}
            >
              Learn how it works
            </Link>
          </UpgradeParagraph>
        </UpgradeColumn>
        <UpgradeIllustrationSlot>
          <UpgradeIllustrationIcon />
        </UpgradeIllustrationSlot>
      </UpgradeContent>

      {/* TODO: replace with actual ETH vault route */}
      <UpgradeButton
        size="lg"
        fullwidth
        onClick={() => setIsDrawerRightOpen(true)}
      >
        Upgrade to Lido Earn ETH
      </UpgradeButton>
    </UpgradeCardBlock>
  );
};
