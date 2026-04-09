import { Accordion } from '@lidofinance/lido-ui';

export const RewardsAfterWithdraw: React.FC = () => {
  return (
    <Accordion summary="Do I still get rewards after I withdraw?">
      <p>
        No. After you request a withdrawal, the stETH/wstETH submitted for
        unstaking will not receive staking rewards on top of your submitted
        balance.
      </p>
    </Accordion>
  );
};
