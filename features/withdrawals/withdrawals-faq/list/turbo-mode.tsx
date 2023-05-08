import { Accordion } from '@lidofinance/lido-ui';

export const TurboMode: React.FC = () => {
  return (
    <Accordion summary="What is Turbo mode?">
      <p>
        Turbo mode is a default mode used unless an emergency event affects the
        Ethereum network. In Turbo Mode, withdrawal requests are fulfilled
        quickly, using all available ETH from user deposits and rewards.
      </p>
    </Accordion>
  );
};
