import { useDGWarningStatus } from 'shared/hooks/useDGWarningStatus';
import {
  BannerWrapper,
  BannerTitle,
  BannerDescription,
  BannerLinkContainer,
} from './styles';
import { BannerLinkButton } from '../banner-link-button';

const DG_TRIGGER_PERCENT = 33;
const DG_LINK = 'REPLACE-ME'; // TODO: replace the link

export const DualGovernanceBanner = ({ children }: React.PropsWithChildren) => {
  const { isWarningState, isBlockedState, currentVetoSupportPercent } =
    useDGWarningStatus();

  // Show banner only for Warning and Blocked DG status
  if (!isWarningState && !isBlockedState) return <>{children}</>;

  return (
    <BannerWrapper $state={isBlockedState ? 'Blocked' : 'Warning'}>
      {isBlockedState && (
        <>
          <BannerTitle>
            Dual Governance: <br />
            Dynamic Timelock active
          </BannerTitle>
          <BannerDescription>
            Lido DAO governance is now in a dynamic timelock.
            <br />
            {currentVetoSupportPercent}% of stETH supply opposes the DAO — the
            staking may carry elevated risk.
            <br />
            Check details on Dual Governance page.
          </BannerDescription>
        </>
      )}
      {isWarningState && (
        <>
          <BannerTitle>Dual Governance activity</BannerTitle>
          <BannerDescription>
            Dual Governance is at{' '}
            <b>{DG_TRIGGER_PERCENT}% of the Veto Signalling threshold.</b> No
            impact to staking. Check the Dual Governance page for status
            overview.
          </BannerDescription>
        </>
      )}
      <BannerLinkContainer>
        <BannerLinkButton href={DG_LINK}>Dual Governance</BannerLinkButton>
      </BannerLinkContainer>
    </BannerWrapper>
  );
};
