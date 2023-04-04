import { Button } from '@lidofinance/lido-ui';
import { useSTETHTotalSupply } from '@lido-sdk/react';
import { useRouter } from 'next/router';
import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import { shortenTokenValue } from 'utils';

export const useInputTvlValidate = (inputValue: string) => {
  const stethTotalSupply = useSTETHTotalSupply();
  const router = useRouter();
  const { ref, embed } = router.query;
  const query = { ref: ref as string, embed: embed as string };
  const searchParam = new URLSearchParams(omitBy(query, isEmpty)).toString();

  const diff =
    (stethTotalSupply.data &&
      parseEther(inputValue || '0').sub(stethTotalSupply.data)) ||
    BigNumber.from(0);

  const tvlMessage =
    stethTotalSupply.data &&
    parseEther(inputValue || '0').gt(stethTotalSupply.data) ? (
      <>
        For this request you are missing just{' '}
        {shortenTokenValue(Number(Number(formatEther(diff))))} stETH. Wanna
        stake more?
      </>
    ) : undefined;

  const stakePath = `/${
    searchParam
      ? `?${searchParam}&amount=${diff.toString()}`
      : `?amount=${inputValue.toString()}`
  }`;

  const stakeButton = (
    <Button
      size="xxs"
      variant="translucent"
      onClick={() => router.push(stakePath)}
    >
      Yes, let`s stake
    </Button>
  );

  return { tvlMessage, stakeButton };
};
