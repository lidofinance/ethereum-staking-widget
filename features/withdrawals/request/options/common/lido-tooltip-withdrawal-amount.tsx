import { Tooltip, Question } from '@lidofinance/lido-ui';
import Link from 'next/link';

export const TooltipWithdrawalAmount = () => {
  return (
    <Tooltip
      placement="topRight"
      title={
        <>
          The final amount of claimable ETH can differ
          <br /> For more info, please read{' '}
          <Link href="#amountDifferentFromRequested">FAQ</Link>
        </>
      }
    >
      <Question />
    </Tooltip>
  );
};
