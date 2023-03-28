import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const NegativeCLRebase: FC = () => {
  return (
    <Accordion summary="What is a negative CL rebase?">
      <p>
        Negative CL rebase occurs when, within a period, aggregate Lido
        validator performance results in penalties exceeding rewards.
      </p>
    </Accordion>
  );
};
