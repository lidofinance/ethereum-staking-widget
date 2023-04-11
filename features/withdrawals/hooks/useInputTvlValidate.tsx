import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot';
import { Button } from '@lidofinance/lido-ui';
import { useSTETHTotalSupply } from '@lido-sdk/react';
import { useRouter } from 'next/router';
import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import { shortenTokenValue, isValidEtherValue } from 'utils';

const texts: Record<string, (amount: string) => string> = {
  '1': (amount) =>
    `That's about ${amount} more than you've got, are you sure you're in the right wallet?`,
  '2': (amount) =>
    `That's about ${amount} more than you've got, would suggest you stake more first!`,
  '3': () =>
    (
      <>
        Didn&apos;t realize you&apos;re a &#x1F40B;, did you leave your stETH in
        your other wallet? No worries, just stake some more!
      </> // TODO: fix this
    ) as unknown as string,
  '4': () => 'Hey Justin Sun, the "stake" button is this way ^',
};

const getText = () => {
  const keys = Object.keys(texts);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return texts[randomKey];
};

export const useInputTvlValidate = (inputValue: string) => {
  const { active } = useWeb3();
  const stethTotalSupply = useSTETHTotalSupply();
  const router = useRouter();
  const { ref, embed } = router.query;
  const query = { ref: ref as string, embed: embed as string };
  const searchParam = new URLSearchParams(omitBy(query, isEmpty)).toString();
  const canCalc = !!(
    isValidEtherValue(inputValue) &&
    active &&
    stethTotalSupply.data
  );

  const diff =
    (canCalc &&
      parseEther(inputValue || '0').sub(stethTotalSupply.data || '0')) ||
    BigNumber.from(0);

  // To render one text per page before refresh
  const text = useMemo(() => getText(), []);
  const tvlMessage =
    canCalc && parseEther(inputValue || '0').gt(stethTotalSupply.data || '0')
      ? text(shortenTokenValue(Number(Number(formatEther(diff)))))
      : undefined;

  const stakePath = `/${
    searchParam
      ? `?${searchParam}&amount=${diff.toString()}`
      : `?amount=${formatEther(diff)}`
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
