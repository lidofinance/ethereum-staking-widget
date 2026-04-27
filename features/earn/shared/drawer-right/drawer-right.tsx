import { FC } from 'react';
import { Close, Button, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useEscape } from 'shared/hooks/useEscape';
import { LocalLink } from 'shared/components/local-link';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import {
  DrawerRightStyled,
  DrawerRightContent,
  DrawerRightWrapper,
  DrawerRightHeader,
  DrawerDescription,
  DrawerRightClose,
  DrawerRightFooter,
  DrawerRightText,
} from './styles';
import { DrawerTable } from './drawer-table';

type DrawerRightProps = {
  onClose: () => void;
  isOpen: boolean;
};

export const DrawerRight: FC<DrawerRightProps> = ({ onClose, isOpen }) => {
  const { handleKeyDown } = useEscape({ onClose });

  return (
    <DrawerRightStyled onKeyDown={handleKeyDown} tabIndex={-1} isOpen={isOpen}>
      <DrawerRightWrapper>
        <DrawerRightContent data-testid={'earn-side-panel'}>
          <DrawerRightHeader>
            <div data-testid={'title'}>
              What is EarnETH Vault and how it works
            </div>
            <DrawerRightClose
              icon={<Close />}
              size="xxs"
              variant="ghost"
              onClick={onClose}
            />
          </DrawerRightHeader>
          <DrawerDescription data-testid={'description'}>
            EarnETH Vault is a meta-vault designed to optimize returns on
            deployed assets across Lido Earn strategies. Today, it allocates
            assets across GGV and stRATEGY, with the ability to dynamically
            evolve its allocation mix. By abstracting strategy selection, the
            meta-vault provides ETH-denominated exposure to Lido Earn with the
            objective of balancing different risk and return profiles for
            ETH-denominated assets.
          </DrawerDescription>
          <DrawerTable />
          <DrawerRightText data-testid={'table-description'}>
            The table above describes structural differences between accessing a
            single vault strategy and accessing a meta-vault that allocates
            across multiple strategies. It is provided for informational
            purposes only and does not constitute a recommendation. Outcomes and
            rewards may vary based on strategy composition, market conditions,
            and protocol parameters.
          </DrawerRightText>
          <DrawerRightText data-testid={'mellow-points-text'}>
            All Mellow points you accumulate remain yours, with your balance
            visible on the{' '}
            <Link
              href="https://app.mellow.finance/dashboard"
              target="_blank"
              onClick={() => {
                trackMatomoEvent(
                  MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthMellowDashboard,
                );
              }}
            >
              Mellow Dashboard
            </Link>
          </DrawerRightText>
          <DrawerRightFooter>
            <LocalLink href={ETH_DEPOSIT_PATH}>
              <Button
                fullwidth
                onClick={() => {
                  trackMatomoEvent(
                    MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthUpgradeNow,
                  );
                }}
                data-testid={'upgradeNowButton'}
              >
                Upgrade now
              </Button>
            </LocalLink>
            <Link href={`${config.helpOrigin}/en`} target="_blank">
              <Button
                fullwidth
                variant="outlined"
                onClick={() => {
                  trackMatomoEvent(
                    MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthGetInTouch,
                  );
                }}
                data-testid={'getInTouchButton'}
              >
                Get in touch
              </Button>
            </Link>
          </DrawerRightFooter>
        </DrawerRightContent>
      </DrawerRightWrapper>
    </DrawerRightStyled>
  );
};
