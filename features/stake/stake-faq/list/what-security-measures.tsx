import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

export const WhatSecurityMeasures: FC = () => {
  return (
    <Accordion summary="What security measures does the Lido protocol have in place?">
      <span>
        In order to provide users with a safe staking platform, the Lido
        protocol fits the next points:
      </span>
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
        Please note that despite these factors potential risks still apply. For
        further information and details please visit the{' '}
        <Link href={'https://lido.fi/terms-of-use'}>Terms of Use</Link>, and
        read the risks of staking with Lido referenced below.
      </p>
    </Accordion>
  );
};
