import { Tooltip, Question } from '@lidofinance/lido-ui';

export const TooltipWithdrawalAmount = () => {
  return (
    <Tooltip
      placement="topRight"
      title={
        <>
          The final amount of claimable ETH can differ
          <br /> For more info, please read FAQ
        </>
      }
    >
      <Question />
    </Tooltip>
  );
};
