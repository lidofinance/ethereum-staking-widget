import { useRef } from 'react';
import { Button, TextLink, Typography } from '@lidofinance/lido-app-ui';

import { config } from 'config';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import {
  DRAWER_WIDTH,
  DrawerRightPanel,
  DrawerRightContent,
  DrawerRightFooter,
} from './styles';
import { DrawerTable } from './drawer-table';

type DrawerRightProps = {
  onClose: () => void;
  isOpen: boolean;
  shouldHideUpgradeNowButton?: boolean;
};

export const DrawerRight = ({
  onClose,
  isOpen,
  shouldHideUpgradeNowButton = false,
}: DrawerRightProps) => {
  // the dialog itself takes focus, so no button lights up on open
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <DrawerRightPanel
      ref={panelRef}
      open={isOpen}
      onClose={() => onClose()}
      width={DRAWER_WIDTH}
      title="What is EarnETH Vault and how it works"
      labels={{ close: 'Close' }}
      initialFocus={panelRef}
      tabIndex={-1}
      data-testid="earn-side-panel"
      dataTestId={{ title: 'title' }}
    >
      <DrawerRightContent>
        <Typography variant="body" color="secondary" data-testid="description">
          EarnETH Vault is a meta-vault designed to optimize returns on deployed
          assets across Lido Earn strategies, with the ability to dynamically
          evolve its allocation mix. By abstracting strategy selection, the
          meta-vault provides ETH-denominated exposure to Lido Earn with the
          objective of balancing different risk and return profiles for
          ETH-denominated assets.
        </Typography>
        <DrawerTable />
        <Typography
          variant="body"
          color="secondary"
          data-testid="table-description"
        >
          The table above describes structural differences between accessing a
          single vault strategy and accessing a meta-vault that allocates across
          multiple strategies. It is provided for informational purposes only
          and does not constitute a recommendation. Outcomes and rewards may
          vary based on strategy composition, market conditions, and protocol
          parameters.
        </Typography>
        <Typography
          variant="body"
          color="secondary"
          data-testid="mellow-points-text"
        >
          All accumulated Mellow points, as well as Obol and SSV rewards, remain
          yours. Your Mellow points balance is visible on the{' '}
          <TextLink
            size="inherit"
            href="https://app.mellow.finance/dashboard"
            onClick={() => {
              trackMatomoEvent(
                MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthMellowDashboard,
              );
            }}
          >
            Mellow Dashboard
          </TextLink>
          . Obol rewards can be claimed{' '}
          <TextLink
            size="inherit"
            href="https://launchpad.obol.org/cluster/list/"
          >
            here
          </TextLink>
          , and SSV rewards can be claimed{' '}
          <TextLink size="inherit" href="https://www.ssvrewards.com/">
            here
          </TextLink>
          .
        </Typography>
        <DrawerRightFooter>
          {!shouldHideUpgradeNowButton && (
            <Button
              href={ETH_DEPOSIT_PATH}
              size="big"
              fullWidth
              onClick={() => {
                trackMatomoEvent(
                  MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthUpgradeNow,
                );
              }}
              dataTestId={{ root: 'upgrade-now-button' }}
            >
              Upgrade now
            </Button>
          )}
          <Button
            href={`${config.helpOrigin}/en`}
            size="big"
            variant="outline"
            fullWidth
            onClick={() => {
              trackMatomoEvent(
                MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthGetInTouch,
              );
            }}
            dataTestId={{ root: 'get-in-touch-button' }}
          >
            Get in touch
          </Button>
        </DrawerRightFooter>
      </DrawerRightContent>
    </DrawerRightPanel>
  );
};
