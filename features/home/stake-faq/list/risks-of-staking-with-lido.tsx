import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { MatomoLink } from 'shared/components';
import { MATOMO_EVENTS } from 'config';

const TITLE = 'What are the risks of staking with Lido?';

export const RisksOfStakingWithLido: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        There exist a number of potential risks when staking ETH using liquid
        staking protocols.
      </p>
      <ul>
        <li>
          <p>Smart contract security</p>
          There is an inherent risk that Lido could contain a smart contract
          vulnerability or bug. The Lido code is open-sourced, audited and
          covered by an extensive bug bounty program to minimise this risk. To
          mitigate smart contract risks, all of the core Lido contracts are
          audited. Audit reports can be found{' '}
          <MatomoLink
            href="https://github.com/lidofinance/audits#lido-protocol-audits"
            matomoEvent={MATOMO_EVENTS.clickFaqRisksOfStakingReports}
          >
            here
          </MatomoLink>
          . Besides, Lido is covered with a massive{' '}
          <MatomoLink
            href="https://immunefi.com/bounty/lido/"
            matomoEvent={MATOMO_EVENTS.clickFaqRisksOfStakingImmunefiBugBounty}
          >
            Immunefi bug bounty program
          </MatomoLink>
          .
        </li>
        <li>
          <p>Beacon chain - Technical risk</p>
          Lido is built atop experimental technology under active development,
          and there is no guarantee that Beacon chain has been developed
          error-free. Any vulnerabilities inherent to Beacon chain brings with
          it slashing risk, as well as stETH fluctuation risk.
        </li>
        <li>
          <p>Beacon chain - Adoption risk</p>
          The value of stETH is built around the staking rewards associated with
          the Ethereum beacon chain. If Beacon chain fails to reach required
          levels of adoption we could experience significant fluctuations in the
          value of ETH and stETH.
        </li>
        <li>
          <p>DAO key management risk</p>
          On early stages of Lido, slightly more than 600k ETH became held
          across multiple accounts backed by a multi-signature threshold scheme
          to minimize custody risk. If signatories across a certain threshold
          lose their key shares, get hacked or go rogue, we risk these funds
          (&#60;13% of total stake as of October 2022) becoming locked.
        </li>
        <li>
          <p>Slashing risk</p>
          Beacon chain validators risk staking penalties, with up to 100% of
          staked funds at risk if validators fail. To minimise this risk, Lido
          stakes across multiple professional and reputable node operators with
          heterogeneous setups, with additional mitigation in the form of
          self-coverage.
        </li>
        <li>
          <p>stETH price risk</p>
          Users risk an exchange price of stETH which is lower than inherent
          value due to withdrawal restrictions on Lido, making arbitrage and
          risk-free market-making impossible. The Lido DAO is driven to mitigate
          above risks and eliminate them entirely to the extent possible.
          Despite this, they may still exist and, as such, it is our duty to
          communicate them.
        </li>
      </ul>
      <p>
        The Lido DAO is driven to mitigate the above risks and eliminate them
        entirely to the extent possible. Despite this, they may still exist.
      </p>
    </Accordion>
  );
};
