---
title: What are the risks of staking with Lido?
---

There exist a number of potential risks when staking ETH using liquid staking protocols.

- Smart contract security

  There is an inherent risk that Lido could contain a smart contract vulnerability or bug. The Lido code is open-sourced, audited and covered by an extensive bug bounty program to minimise this risk. To mitigate smart contract risks, all of the core Lido contracts undergo multiple audits are audited. Audit reports can be found here. Besides, Lido is covered with a massive [Immunefi bugbounty program](https://immunefi.com/bounty/lido/).

- Beacon chain - Technical risk

  Lido is built atop experimental technology under active development, and there is no guarantee that Beacon chain has been developed error-free. Any vulnerabilities inherent to Beacon chain brings with it slashing risk, as well as stETH fluctuation risk.

- Beacon chain - Adoption risk

  The value of stETH is built around the staking rewards associated with the Ethereum beacon chain. If Beacon chain fails to reach required levels of adoption we could experience significant fluctuations in the value of ETH and stETH.

- DAO key management risk

  On early stages of Lido, slightly more than 600k ETH became held across multiple accounts backed by a multi-signature threshold scheme to minimize custody risk. If signatories across a certain threshold lose their key shares, get hacked or go rogue, we risk these funds (<13% of total stake as of October 2022) becoming locked.

- Slashing risk

  Beacon chain validators risk staking penalties, with up to 100% of staked funds at risk if validators fail. To minimise this risk, Lido stakes across multiple professional and reputable node operators with heterogeneous setups, with additional mitigation in the form of self-coverage.

- stETH price risk

  Users risk an exchange price of stETH which is lower than inherent value due to withdrawal restrictions on Lido, making arbitrage and risk-free market-making impossible. The Lido DAO is driven to mitigate above risks and eliminate them entirely to the extent possible. Despite this, they may still exist and, as such, it is our duty to communicate them.
