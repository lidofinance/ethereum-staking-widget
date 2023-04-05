import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const BunkerModeReasons: FC = () => {
  return (
    <Accordion
      summary="What scenarios can cause Bunker mode?"
      id="bunkerModeScenarios"
    >
      <ol>
        <li>
          New or ongoing mass slashing that can cause a negative CL rebase
          within any frame during the slashing resolution period.
        </li>
        <li>Negative CL rebase in the current frame.</li>
        <li>
          Lower than expected CL rebase in the current frame and a negative CL
          rebase in the end of the frame.
        </li>
      </ol>
    </Accordion>
  );
};
