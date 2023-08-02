import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const SafeWorkWithLido: FC = () => {
  return (
    <Accordion summary="Is it safe to work with Lido?">
      <span> In order to work safe, Lido fits the next points:</span>
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
        <li>
          Lido has been audited by Certora, StateMind, Hexens, ChainSecurity,
          Oxorio, MixBytes, SigmaPrime, Quantstamp. Lido audits can be found in
          more detail{' '}
          <Link
            href={'https://github.com/lidofinance/audits'}
            data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqSafeWorkWithLidoAudits}
          >
            here
          </Link>
          .
        </li>
      </ul>
      <p>
        Usually when staking ETH you choose only one validator. In the case of
        Lido you stake across many validators, minimising your staking risk.
      </p>
    </Accordion>
  );
};
