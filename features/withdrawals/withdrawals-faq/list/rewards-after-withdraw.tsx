import { Accordion } from '@lidofinance/lido-ui';

export const RewardsAfterWithdraw: React.FC = () => {
  return (
    <Accordion summary="Do I still get rewards after I withdraw or swap?">
      <p>
        No. After you request a withdrawal or execute a swap, the stETH/wstETH
        submitted will not receive staking rewards on top of your submitted
        balance.
      </p>
    </Accordion>
  );
};
