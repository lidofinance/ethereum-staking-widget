import { FC, useRef } from 'react';
import { Button, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { LocalLink } from 'shared/components/local-link';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import {
  DRAWER_WIDTH,
  DrawerRightPanel,
  DrawerRightContent,
  DrawerRightTitle,
  DrawerDescription,
  DrawerRightFooter,
  DrawerRightText,
} from './styles';
import { DrawerTable } from './drawer-table';

type DrawerRightProps = {
  onClose: () => void;
  isOpen: boolean;
  shouldHideUpgradeNowButton?: boolean;
};

export const DrawerRight: FC<DrawerRightProps> = ({
  onClose,
  isOpen,
  shouldHideUpgradeNowButton = false,
}) => {
  // the dialog itself takes focus, so no button lights up on open
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <DrawerRightPanel
      ref={panelRef}
      open={isOpen}
      onClose={() => onClose()}
      width={DRAWER_WIDTH}
      title={
        <DrawerRightTitle>
          What is EarnETH Vault and how it works
        </DrawerRightTitle>
      }
      labels={{ close: 'Close' }}
      initialFocus={panelRef}
      tabIndex={-1}
      data-testid="earn-side-panel"
      dataTestId={{ title: 'title' }}
    >
      <DrawerRightContent>
        <DrawerDescription data-testid="description">
          EarnETH Vault is a meta-vault designed to optimize returns on deployed
          assets across Lido Earn strategies, with the ability to dynamically
          evolve its allocation mix. By abstracting strategy selection, the
          meta-vault provides ETH-denominated exposure to Lido Earn with the
          objective of balancing different risk and return profiles for
          ETH-denominated assets.
        </DrawerDescription>
        <DrawerTable />
        <DrawerRightText data-testid="table-description">
          The table above describes structural differences between accessing a
          single vault strategy and accessing a meta-vault that allocates across
          multiple strategies. It is provided for informational purposes only
          and does not constitute a recommendation. Outcomes and rewards may
          vary based on strategy composition, market conditions, and protocol
          parameters.
        </DrawerRightText>
        <DrawerRightText data-testid="mellow-points-text">
          All accumulated Mellow points, as well as Obol and SSV rewards, remain
          yours. Your Mellow points balance is visible on the{' '}
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
          . Obol rewards can be claimed{' '}
          <Link href="https://launchpad.obol.org/cluster/list/" target="_blank">
            here
          </Link>
          , and SSV rewards can be claimed{' '}
          <Link href="https://www.ssvrewards.com/" target="_blank">
            here
          </Link>
          .
        </DrawerRightText>
        <DrawerRightFooter>
          {!shouldHideUpgradeNowButton && (
            <LocalLink href={ETH_DEPOSIT_PATH}>
              <Button
                fullwidth
                onClick={() => {
                  trackMatomoEvent(
                    MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthUpgradeNow,
                  );
                }}
                data-testid="upgrade-now-button"
              >
                Upgrade now
              </Button>
            </LocalLink>
          )}
          <Link href={`${config.helpOrigin}/en`} target="_blank">
            <Button
              fullwidth
              variant="outlined"
              onClick={() => {
                trackMatomoEvent(
                  MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthGetInTouch,
                );
              }}
              data-testid="get-in-touch-button"
            >
              Get in touch
            </Button>
          </Link>
        </DrawerRightFooter>
      </DrawerRightContent>
    </DrawerRightPanel>
  );
};
