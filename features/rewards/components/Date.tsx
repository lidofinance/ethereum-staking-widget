import { Tooltip, Box } from '@lidofinance/lido-ui';
import { lightFormat, fromUnixTime } from 'date-fns';
import type { Event } from 'features/rewards/types';

// TODO: move to separate folders
const Date = ({ blockTime }: { blockTime: Event['blockTime'] }) => {
  const parsed = fromUnixTime(parseInt(blockTime));

  const light = lightFormat(parsed, 'dd.MM.yyyy');
  const full = lightFormat(parsed, 'dd.MM.yyyy HH:mm');

  return (
    <Tooltip
      className="tooltip"
      placement="bottom"
      title={<Box padding="12px!important">{full}</Box>}
    >
      <span>{light}</span>
    </Tooltip>
  );
};

export default Date;
