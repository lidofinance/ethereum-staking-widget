import { useNavigate } from 'react-router';
import { formatEther } from 'viem';
import { Button } from '@lidofinance/lido-ui';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

type InputDecoratorTvlStakeProps = {
  tvlDiff: bigint;
};

export const InputDecoratorTvlStake = ({
  tvlDiff,
}: InputDecoratorTvlStakeProps) => {
  const navigate = useNavigate();
  const queryString = useSafeQueryString({ amount: formatEther(tvlDiff) });
  return (
    <Button
      size="xxs"
      variant="translucent"
      data-testid="letsStakeBtn"
      onClick={() => void navigate(`/${queryString}`)}
    >
      Yes, let`s stake
    </Button>
  );
};
