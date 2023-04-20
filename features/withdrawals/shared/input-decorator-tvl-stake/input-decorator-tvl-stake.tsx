import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { useRouter } from 'next/router';
import { Button } from '@lidofinance/lido-ui';

type InputDecoratorTvlStakeProps = {
  tvlDiff: BigNumber;
};

export const InputDecoratorTvlStake = ({
  tvlDiff,
}: InputDecoratorTvlStakeProps) => {
  const router = useRouter();
  const { ref, embed } = router.query;
  const query = { ref: ref as string, embed: embed as string };
  const searchParam = new URLSearchParams(omitBy(query, isEmpty)).toString();

  const stakePath = `/${
    searchParam
      ? `?${searchParam}&amount=${tvlDiff.toString()}`
      : `?amount=${formatEther(tvlDiff)}`
  }`;

  return (
    <Button
      size="xxs"
      variant="translucent"
      onClick={() => router.push(stakePath)}
    >
      Yes, let`s stake
    </Button>
  );
};
