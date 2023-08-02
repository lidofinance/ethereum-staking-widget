import { NoBr } from '../styles';
import { Accordion } from '@lidofinance/lido-ui';

export const BunkerWhileRequestOngoing: React.FC = () => {
  return (
    <Accordion summary="If Bunker mode happens when I’ve already submitted a withdrawal request, do I need to wait longer?">
      <p>
        Most often, the stETH/wstETH withdrawal period will be from{' '}
        <NoBr>1-5 days</NoBr>. However, if any scenarios cause Bunker mode to
        happen, this could be extended.
      </p>
    </Accordion>
  );
};
