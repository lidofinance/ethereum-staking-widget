import type { ReactNode } from 'react';
import { SegmentedControl } from '@lidofinance/lido-app-ui';

import type { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { useDappStatus } from 'modules/web3';
import { useLocalNavigate } from 'shared/components/local-link';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { ACTION_ITEMS, GLOWS } from './consts';
import {
  GlowWrapper,
  PanelBody,
  PanelCard,
  PanelContent,
  Stack,
} from './styles';
import type { VaultAction, VaultPositionSummary } from './types';
import { VaultPositionBox } from './vault-position-box';

type VaultSidePanelProps = {
  variant: keyof typeof GLOWS;
  action: VaultAction;
  routes: Record<VaultAction, string>;
  matomo?: Partial<Record<VaultAction, MATOMO_EVENT_TYPE>>;
  position: VaultPositionSummary;
  apx?: number | null;
  isApxLoading?: boolean;
  // shown above the action switch, e.g. the geo notice
  notice?: ReactNode;
  // separate cards above the panel, e.g. the token upgrade
  before?: ReactNode;
  children: ReactNode;
};

export const VaultSidePanel = ({
  variant,
  action,
  routes,
  matomo,
  position,
  apx,
  isApxLoading,
  notice,
  before,
  children,
}: VaultSidePanelProps) => {
  const { isWalletConnected } = useDappStatus();
  const navigate = useLocalNavigate();
  const Glow = GLOWS[variant];

  const handleActionChange = (value: string) => {
    const nextAction = value as VaultAction;
    if (nextAction === action) return;
    const event = matomo?.[nextAction];
    if (event) trackMatomoEvent(event);
    void navigate(routes[nextAction], { scroll: false });
  };

  return (
    <Stack>
      {before}
      <PanelCard padding={0} gap={0} data-testid="vault-side-panel">
        <GlowWrapper aria-hidden="true">
          <Glow />
        </GlowWrapper>
        <PanelContent>
          {notice}
          <SegmentedControl
            items={ACTION_ITEMS}
            value={action}
            onChange={handleActionChange}
            aria-label="Vault action"
            dataTestId={{ root: 'switcher' }}
          />
          <PanelBody>
            {isWalletConnected && (
              <VaultPositionBox
                position={position}
                apx={apx}
                isApxLoading={isApxLoading}
              />
            )}
            {children}
          </PanelBody>
        </PanelContent>
      </PanelCard>
    </Stack>
  );
};
