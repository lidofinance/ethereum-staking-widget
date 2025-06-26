import { useDGWarningStatus } from 'shared/hooks/useDGWarningStatus';
import { BannerWrapper, BannerLinkContainer } from './styles';

import { BlockedState } from './blocked-state';
import { WarningState } from './warning-state';
import { Button, Link } from '@lidofinance/lido-ui';

const DG_TRIGGER_PERCENT = 33;
const DG_LINK = 'https://dg.lido.fi';

export const DualGovernanceBanner = ({ children }: React.PropsWithChildren) => {
  const {
    isWarningState,
    isBlockedState,
    isDGBannerEnabled,
    currentVetoSupportPercent,
  } = useDGWarningStatus();

  const isDGActive = isWarningState || isBlockedState;
  if (!isDGActive || !isDGBannerEnabled) return <>{children}</>;

  // we dont want to show banner if blocked state is true and currentVetoSupportPercent is not set
  if (isBlockedState && !currentVetoSupportPercent) return <>{children}</>;
  const dgState = isBlockedState ? 'Blocked' : 'Warning';

  return (
    <BannerWrapper $state={dgState}>
      {dgState === 'Blocked' && (
        <BlockedState
          currentVetoSupportPercent={currentVetoSupportPercent ?? 0}
        />
      )}
      {dgState === 'Warning' && (
        <WarningState dgTriggerPercent={DG_TRIGGER_PERCENT} />
      )}
      <BannerLinkContainer>
        <Link href={DG_LINK}>
          <Button size="xs" color="primary">
            Dual Governance
          </Button>
        </Link>
      </BannerLinkContainer>
    </BannerWrapper>
  );
};
