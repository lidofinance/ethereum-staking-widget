import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';

import { shortenTokenValue } from 'utils';

const texts: ((amount: string) => string)[] = [
  (amount) =>
    `That's about ${amount} more than we've got, would suggest you stake more first!`,
  () =>
    `Didn't realize you're a 🐋, did you leave your stETH in your other wallet? No worries, just stake some more!`,
  () => 'Hey Justin Sun, the "stake" button is this way ^',
];

const getText = () => texts[Math.floor(Math.random() * texts.length)];

export const useTvlMessage = (balanceDiff?: BigNumber) => {
  // To render one text per page before refresh
  const textTemplate = useMemo(() => getText(), []);

  return useMemo(
    () =>
      balanceDiff
        ? textTemplate(shortenTokenValue(Number(formatEther(balanceDiff))))
        : undefined,
    [balanceDiff, textTemplate],
  );
};
