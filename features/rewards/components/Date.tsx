import { Tooltip, Box } from '@lidofinance/lido-ui';
import type { Event } from 'features/rewards/types';
import { fromUnixTime } from '../utils/fromUnixTime';
import { formatDate } from '../utils/formatDate';

// TODO: move to separate folders
const Date = ({ blockTime }: { blockTime: Event['blockTime'] }) => {
  const parsed = fromUnixTime(parseInt(blockTime));

  const light = formatDate(parsed);
  const full = formatDate(parsed, true);

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
