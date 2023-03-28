import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const BunkerMode: FC = () => {
  return (
    <Accordion summary="What is Bunker mode?">
      <p>
        Bunker Mode is when withdrawal requests are paused until the negative
        events’ consequences are resolved. It pauses withdrawals across all Lido
        stakers during catastrophic scenarios.
      </p>
    </Accordion>
  );
};
