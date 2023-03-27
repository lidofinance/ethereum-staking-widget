import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const BunkerMode: FC = () => {
  return (
    <Accordion summary="What is Bunker mode?">
      <p>
        Bunker Mode delays withdrawals across all Lido stakers during
        catastrophic scenarios to prevent sophisticated actors from gaining an
        unfair advantage against other stakers.
      </p>
    </Accordion>
  );
};
