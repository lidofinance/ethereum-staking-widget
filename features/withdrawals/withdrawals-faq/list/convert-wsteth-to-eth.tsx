import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const ConvertWSTETHtoETH: FC = () => {
  return (
    <Accordion summary="Can I convert my wstETH to ETH?">
      <p>
        Yes. Convert your wstETH to ETH using the ‘Request’ and ‘Claim’ tabs.
      </p>
    </Accordion>
  );
};
