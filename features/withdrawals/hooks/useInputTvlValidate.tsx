import { useMemo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useSTETHTotalSupply } from '@lido-sdk/react';

import { shortenTokenValue, isValidEtherValue } from 'utils';

const texts: ((amount: string) => string)[] = [
  (amount) =>
    `That's about ${amount} more than you've got, would suggest you stake more first!`,
  () =>
    `Didn't realize you're a 🐋, did you leave your stETH in your other wallet? No worries, just stake some more!`,
  () => 'Hey Justin Sun, the "stake" button is this way ^',
];

const getText = () => texts[Math.floor(Math.random() * texts.length)];

export const useInputTvlValidate = (inputValue: string) => {
  const { active } = useWeb3();
  const { data: stethTotalSupply } = useSTETHTotalSupply();

  const tvlDiff = useMemo(() => {
    const canCalc =
      active && isValidEtherValue(inputValue) && stethTotalSupply !== undefined;

    if (!canCalc) return BigNumber.from(0);

    return parseEther(inputValue || '0').sub(stethTotalSupply || '0');
  }, [active, inputValue, stethTotalSupply]);

  // To render one text per page before refresh
  const textTemplate = useMemo(() => getText(), []);

  console.log(formatEther(tvlDiff));

  const tvlMessage = useMemo(
    () =>
      tvlDiff.gt(BigNumber.from(0))
        ? textTemplate(shortenTokenValue(Number(formatEther(tvlDiff))))
        : undefined,
    [textTemplate, tvlDiff],
  );

  return {
    tvlDiff,
    tvlMessage,
  };
};
