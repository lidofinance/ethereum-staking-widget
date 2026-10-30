import { useCallback, type FC } from 'react';
import { Close } from '@lidofinance/lido-ui';

import { useConfig } from 'config';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { useSsrMode } from 'shared/hooks/useSsrMode';

import { Wrapper, InfoIcon, Text, Title, CloseButton } from './styles';

const EARN_INFO_BANNER_DISMISSED_STORAGE_KEY =
  'lido-earn-info-banner-dismissed';

export const EarnInfoBanner: FC = () => {
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
    <Wrapper data-testid="earn-info-banner">
      <InfoIcon />
      <Text>
        {title && <Title>{title}</Title>} {text}
      </Text>
      <CloseButton type="button" onClick={dismiss} aria-label="Close">
        <Close width={20} height={20} />
      </CloseButton>
    </Wrapper>
  );
};
