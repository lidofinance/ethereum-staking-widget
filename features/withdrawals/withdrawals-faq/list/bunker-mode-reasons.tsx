import { Accordion } from '@lidofinance/lido-ui';

export const BunkerModeReasons: React.FC = () => {
  return (
    <Accordion
      summary="What scenarios can cause Bunker mode?"
      id="bunkerModeScenarios"
    >
      <p>
        Bunker mode is triggered under three conditions when the penalties might
        be big enough to have a significant impact on the protocol’s rewards:
      </p>
      <ol>
        <li>Mass slashing.</li>
        <li>
          Penalties exceeding rewards in the current period between two Oracle
          reports.
        </li>
        <li>
          Lower than expected Lido validators performance in the current period
          between two Oracle reports and penalties exceeding rewards at the end
          of&nbsp;it.
        </li>
      </ol>
    </Accordion>
  );
};
