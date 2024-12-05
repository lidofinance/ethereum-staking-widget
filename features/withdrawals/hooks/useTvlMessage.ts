import { useMemo } from 'react';
import { formatEther } from 'viem';

import { shortenTokenValue } from 'utils';
import { useTvlError } from './useTvlError';

const texts: ((amount: string) => string)[] = [
  (amount) =>
    `That's about ${amount} more than we've got, would suggest you stake more first!`,
  () =>
    `Didn't realize you're a 🐋, did you leave your stETH in your other wallet? No worries, just stake some more!`,
  () => 'Hey Justin Sun, the "stake" button is this way ^',
];

const getText = () => texts[Math.floor(Math.random() * texts.length)];

export const useTvlMessage = () => {
  // To render one text per page before refresh
  const textTemplate = useMemo(() => getText(), []);

  const { balanceDiffSteth, tvlDiff } = useTvlError();

  return {
    balanceDiff: balanceDiffSteth,
    tvlMessage: useMemo(
      () =>
        tvlDiff
          ? textTemplate(shortenTokenValue(Number(formatEther(tvlDiff))))
          : undefined,
      [tvlDiff, textTemplate],
    ),
  };
};
