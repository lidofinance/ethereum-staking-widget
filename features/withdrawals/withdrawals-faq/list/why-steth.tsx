import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhySTETH: FC = () => {
  return (
    <Accordion summary="Why, while I requested to withdraw wstETH, I see stETH amount in my request?">
      <p>
        When you request to withdraw wstETH, first it’s automatically unwrapped
        into stETH, then it takes time to convert stETH into ETH. The main
        withdrawal period is when stETH converts into ETH. That&apos;s why you
        see the amount of stETH on pending.
      </p>
    </Accordion>
  );
};
