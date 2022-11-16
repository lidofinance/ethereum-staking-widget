import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const RisksOfStakingWithLido: FC = () => {
  return (
    <Accordion summary="What are the risks of staking with Lido?">
      <p>
        There exist a number of potential risks when staking ETH using liquid
        staking protocols.
      </p>
      <ul>
        <li>
          <span>Smart contract security</span>
          <p>
            There is an inherent risk that Lido could contain a smart contract
            vulnerability or bug. The Lido code is open-sourced, audited and
            covered by an extensive bug bounty program to minimise this risk. To
            mitigate smart contract risks, all of the core Lido contracts are
            audited. Audit reports can be found{' '}
            <Link
              href="https://github.com/lidofinance/audits#lido-protocol-audits"
              data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingReports}
            >
              here
            </Link>
            . Besides, Lido is covered with a massive{' '}
            <Link
              href="https://immunefi.com/bounty/lido/"
              data-matomo={
                MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingImmunefiBugBounty
              }
            >
              Immunefi bug bounty program
            </Link>
            .
          </p>
        </li>
        <li>
          <span>Beacon chain - Technical risk</span>
          <p>
            Lido is built atop experimental technology under active development,
            and there is no guarantee that Beacon chain has been developed
            error-free. Any vulnerabilities inherent to Beacon chain brings with
            it slashing risk, as well as stETH fluctuation risk.
          </p>
        </li>
        <li>
          <span>Beacon chain - Adoption risk</span>
          <p>
            The value of stETH is built around the staking rewards associated
            with the Ethereum beacon chain. If Beacon chain fails to reach
            required levels of adoption we could experience significant
            fluctuations in the value of ETH and stETH.
          </p>
        </li>
        <li>
          <span>DAO key management risk</span>
          <p>
            On early stages of Lido, slightly more than 600k ETH became held
            across multiple accounts backed by a multi-signature threshold
            scheme to minimize custody risk. If signatories across a certain
            threshold lose their key shares, get hacked or go rogue, we risk
            these funds (&#60;13% of total stake as of October 2022) becoming
            locked.
          </p>
        </li>
        <li>
          <span>Slashing risk</span>
          <p>
            Beacon chain validators risk staking penalties, with up to 100% of
            staked funds at risk if validators fail. To minimise this risk, Lido
            stakes across multiple professional and reputable node operators
            with heterogeneous setups, with additional mitigation in the form of
            self-coverage.
          </p>
        </li>
        <li>
          <span>stETH price risk</span>
          <p>
            Users risk an exchange price of stETH which is lower than inherent
            value due to withdrawal restrictions on Lido, making arbitrage and
            risk-free market-making impossible. The Lido DAO is driven to
            mitigate above risks and eliminate them entirely to the extent
            possible. Despite this, they may still exist and, as such, it is our
            duty to communicate them.
          </p>
        </li>
      </ul>
      <p>
        The Lido DAO is driven to mitigate the above risks and eliminate them
        entirely to the extent possible. Despite this, they may still exist.
      </p>
    </Accordion>
  );
};
