import { useCallback } from 'react';
import styled from 'styled-components';
import { IconWarning } from '@lidofinance/lido-app-ui';

import { useConfig } from 'config';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { useSsrMode } from 'shared/hooks/useSsrMode';

import { EarnNotification } from '../earn-notification';

const EARN_INFO_BANNER_DISMISSED_STORAGE_KEY =
  'lido-earn-info-banner-dismissed';

const WarningIcon = styled(IconWarning)`
  color: var(--lido-app-ui-color-icons-warning);
`;

export const EarnInfoBanner = () => {
  const { featureFlags, earnInfoBanner } = useConfig().externalConfig;
  const { title, text } = earnInfoBanner;
  const isSsr = useSsrMode();

  // A new text in the manifest shows the banner again.
  const [dismissedText, setDismissedText] = useLocalStorage<string | null>(
    EARN_INFO_BANNER_DISMISSED_STORAGE_KEY,
    null,
  );
  const isDismissed = !!text && dismissedText === text;

  const dismiss = useCallback(
    () => setDismissedText(text ?? null),
    [setDismissedText, text],
  );

  // The server does not know the localStorage state.
  // Show the banner only after mount to prevent a hydration mismatch.
  if (!featureFlags.earnInfoBannerEnabled || !text || isSsr || isDismissed) {
    return null;
  }

  return (
    <EarnNotification
      title={title}
      titleIcon={title ? <WarningIcon /> : undefined}
      onClose={dismiss}
      data-testid="earn-info-banner"
    >
      {text}
    </EarnNotification>
  );
};
