import { useRouter } from 'next/router';
// TODO: NEW SDK
import { formatEther } from 'viem';
// import { formatEther } from '@ethersproject/units';
import { Button } from '@lidofinance/lido-ui';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

type InputDecoratorTvlStakeProps = {
  tvlDiff: bigint;
};

export const InputDecoratorTvlStake = ({
  tvlDiff,
}: InputDecoratorTvlStakeProps) => {
  const { push } = useRouter();
  const queryString = useSafeQueryString({ amount: formatEther(tvlDiff) });
  return (
    <Button
      size="xxs"
      variant="translucent"
      data-testid="letsStakeBtn"
      onClick={() => void push(`/${queryString}`)}
    >
      Yes, let`s stake
    </Button>
  );
};
