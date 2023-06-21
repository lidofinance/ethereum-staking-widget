import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { useRouter } from 'next/router';
import { Button } from '@lidofinance/lido-ui';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

type InputDecoratorTvlStakeProps = {
  tvlDiff: BigNumber;
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
      onClick={() => push(`/${queryString}`)}
    >
      Yes, let`s stake
    </Button>
  );
};
