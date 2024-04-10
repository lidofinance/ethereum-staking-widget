import { Accordion } from '@lidofinance/lido-ui';
import { useScrollToId } from '../utils/useScrollToId';

export const TurboMode: React.FC = () => {
  const { id, opened } = useScrollToId('whatIsTurboMode');
  return (
    <Accordion id={id} defaultExpanded={opened} summary="What is Turbo mode?">
      <p>
        Turbo mode is a default mode used unless an emergency event affects the
        Ethereum network. In Turbo Mode, withdrawal requests are fulfilled
        quickly, using all available ETH from user deposits and rewards.
      </p>
    </Accordion>
  );
};
