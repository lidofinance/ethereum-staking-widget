import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const WhatIsInsuranceFundFor: FC = () => {
  return (
    <Accordion summary="What is the Lido Insurance Fund used for?">
      <p>
        Lido{' '}
        <Link
          href="https://etherscan.io/address/0x8B3f33234ABD88493c0Cd28De33D583B70beDe35"
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqLidoInsuranceFund}
        >
          Insurance fund
        </Link>{' '}
        can cover most of the slashing risks. Read more about risk scenarios{' '}
        <Link
          href="https://research.lido.fi/t/redirecting-incoming-revenue-stream-from-insurance-fund-to-dao-treasury/2528/20?u=kadmil"
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqLidoInsuranceFundRiskScenarios
          }
        >
          here
        </Link>
      </p>
      <p>
        In case of a widespread slashing incident (which is still possible, but
        unlikely to happen given the quality of the Lido validator set and its
        proven track record) the decision to recover losses from this Insurance
        fund will be made based on the vote of the Lido DAO.
      </p>
    </Accordion>
  );
};
