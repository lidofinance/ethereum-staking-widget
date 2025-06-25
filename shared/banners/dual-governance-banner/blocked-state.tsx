import { BannerTitle, BannerDescription } from './styles';

export const BlockedState = ({
  currentVetoSupportPercent,
}: {
  currentVetoSupportPercent: number;
}) => {
  return (
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
  );
};
