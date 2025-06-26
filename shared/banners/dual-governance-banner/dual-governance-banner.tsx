import { useDGWarningStatus } from 'shared/hooks/useDGWarningStatus';
import { BannerWrapper, BannerLinkContainer } from './styles';

import { BlockedState } from './blocked-state';
import { WarningState } from './warning-state';
import { Button, Link } from '@lidofinance/lido-ui';

const DG_TRIGGER_PERCENT = 33;
const DG_LINK = 'https://dg.lido.fi';

export const DualGovernanceBanner = ({ children }: React.PropsWithChildren) => {
  const { isDGBannerEnabled, vetoSupportPercent, isDGActive, dgWarningState } =
    useDGWarningStatus();

  if (!isDGActive || !isDGBannerEnabled) return <>{children}</>;

  return (
    <BannerWrapper $state={dgWarningState}>
      {dgWarningState === 'Blocked' && (
        <BlockedState vetoSupportPercent={vetoSupportPercent ?? 0} />
      )}
      {dgWarningState === 'Warning' && (
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
