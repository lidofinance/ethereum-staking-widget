import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const SafeWorkWithLido: FC = () => {
  return (
    <Accordion summary="Is it safe to work with Lido?">
      <span> Lido is a liquid staking solution and fits the next points:</span>
      <ul>
        <li>Open-sourcing & continuous review of all code.</li>
        <li>
          Committee of elected, best-in-class validators to minimise staking
          risk.
        </li>
        <li>
          Use of non-custodial staking service to eliminate counterparty risk.
        </li>
        <li>
          Use of DAO for governance decisions &amp; to manage risk factors.
        </li>
      </ul>
      <p>
        Usually when staking ETH you choose only one validator. In the case of
        Lido you stake across many validators, minimising your staking risk.
      </p>
    </Accordion>
  );
};
