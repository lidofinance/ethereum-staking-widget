import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { NoBr } from '../styles';

export const SlashingWhileRequestOngoing: FC = () => {
  return (
    <Accordion summary="If slashing happens when I’ve already submitted a withdrawal request, do I need to wait longer?">
      <p>
        The default unstaking period is <NoBr>1-5 days</NoBr>. However, if
        slashing occurs, this could be extended to <NoBr>18-30 days</NoBr>.
      </p>
    </Accordion>
  );
};
