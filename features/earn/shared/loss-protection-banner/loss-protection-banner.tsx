import { useCallback } from 'react';
import { TextLink } from '@lidofinance/lido-app-ui';

import { LossProtectionIllustration } from 'assets/earn';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { useSsrMode } from 'shared/hooks/useSsrMode';
import { useInpageNavigation } from 'providers/inpage-navigation';

import { EarnNotification } from '../earn-notification';
import { FAQ_LOSS_PROTECTION_ID } from '../faq';

const LOSS_PROTECTION_BANNER_DISMISSED_STORAGE_KEY =
  'lido-earn-loss-protection-banner-dismissed';

export const LossProtectionBanner = () => {
  const isSsr = useSsrMode();
  const { navigateInpageAnchor } = useInpageNavigation();
  const [isDismissed, setIsDismissed] = useLocalStorage(
    LOSS_PROTECTION_BANNER_DISMISSED_STORAGE_KEY,
    false,
  );

  const dismiss = useCallback(() => setIsDismissed(true), [setIsDismissed]);

  // The server does not know the localStorage state.
  // Show the banner only after mount to prevent a hydration mismatch.
  if (isSsr || isDismissed) return null;

  return (
    <EarnNotification
      title="Two layers of loss protection"
      illustration={<LossProtectionIllustration />}
      onClose={dismiss}
      data-testid="loss-protection-banner"
    >
      EarnETH and EarnUSD now have two layers of loss protection: Firelight
      absorbs eligible and approved losses first, followed by the Lido
      DAO&rsquo;s loss protection.{' '}
      {/* The hash opens the FAQ drawer on this item */}
      <TextLink
        size="inherit"
        href={`#${FAQ_LOSS_PROTECTION_ID}`}
        onClick={navigateInpageAnchor}
      >
        Learn more
      </TextLink>
    </EarnNotification>
  );
};
