import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { NoBr } from '../styles';

export const HowDoesWithdrawalsWork: FC = () => {
  return (
    <Accordion summary="How does the withdrawal process work?">
      <p>The withdrawal process is simple and has two steps:</p>
      <ol>
        <li>
          <b>Request withdrawal</b>: Lock your stETH by issuing a withdrawal
          request. ETH is sourced to fulfill the request, locked, and the locked
          stETH is burned, which marks the withdrawal request as claimable. Most
          often, it takes <NoBr>1-5 days</NoBr>.
        </li>
        <li>
          <b>Claim</b>: Claim your ETH after the withdrawal request has been
          processed.
        </li>
      </ol>
    </Accordion>
  );
};
