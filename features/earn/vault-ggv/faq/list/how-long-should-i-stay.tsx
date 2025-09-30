import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowLongShouldIStay: FC = () => {
  return (
    <Accordion
      summary="How long should I stay in GGV to get rewards?"
      id="how-long-should-i-stay"
    >
      <p>
        GGV is designed as a mid- to long-term product. Similar to holding
        wstETH, the value of GG units grows steadily over time. Staying invested
        longer helps smooth out short-term volatility and allows the vault
        strategies to generate meaningful rewards. However, please note this is
        for general information purposes only, as users should make their own
        decision on how long to participate based on their individual
        circumstances, and after conducting research and seeking professional
        guidance.
      </p>
    </Accordion>
  );
};
