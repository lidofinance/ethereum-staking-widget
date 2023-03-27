import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const ConvertSTETHtoETH: FC = () => {
  return (
    <Accordion summary="Can I convert my stETH to ETH?">
      <p>
        Yes. Stakers can convert their stETH to ETH 1:1 using the ‘Request’ and
        ‘Claim’ tabs.
      </p>
    </Accordion>
  );
};
