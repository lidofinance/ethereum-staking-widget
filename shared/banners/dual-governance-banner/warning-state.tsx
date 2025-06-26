import { BannerTitle, BannerDescription } from './styles';

export const WarningState = ({
  dgTriggerPercent,
}: {
  dgTriggerPercent: number;
}) => {
  return (
    <>
      <BannerTitle>Dual Governance activity</BannerTitle>
      <BannerDescription>
        Dual Governance is at{' '}
        <b>{dgTriggerPercent}% of the Veto Signalling threshold.</b> No impact
        to staking. Check the Dual Governance page for status overview.
      </BannerDescription>
    </>
  );
};
