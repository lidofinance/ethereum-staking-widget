---
pages:
  - identification: stake
    faq:
      - question: What is Lido?
        answer:
          Lido is the name of a family of open-source peer-to-system software
          tools deployed and functioning on the Ethereum, Solana, and Polygon
          blockchain networks. The software enables users to mint transferable
          utility tokens, which receive rewards linked to the related validation
          activities of writing data to the blockchain, while the tokens can be
          used in other on-chain activities.
        questionId: WhatIsLido
      - question: How does Lido work?
        answer:
          While each network works differently, generally, the Lido protocols
          batch user tokens to stake with validators and route the staking
          packages to network staking contracts. Users mint amounts of stTokens
          which correspond to the amount of tokens sent as stake and they
          receive staking rewards. When they unstake, they burn the stToken to
          initiate the network-specific withdrawal process to withdraw the
          balance of stake and rewards.
        questionId: HowDoesLidoWork
      - question: Is it safe to work with Lido?
        answer: >-
          In order to work safe, Lido fits the next points:


          * Open-sourcing & continuous review of all code.

          * Committee of elected, best-in-class validators to minimise staking risk.

          * Use of non-custodial staking service to eliminate counterparty risk.

          * Use of DAO for governance decisions & to manage risk factors.

          * Lido has been audited by Certora, StateMind, Hexens, ChainSecurity, Oxorio, MixBytes, SigmaPrime, Quantstamp. Lido audits can be found in more detail [here](https://github.com/lidofinance/audits).


          Usually when staking ETH you choose only one validator. In the case of Lido you stake across many validators, minimising your staking risk.
        questionId: qID
      - question: What are the risks of staking with Lido?
        answer: >-
          There exist a number of potential risks when staking using liquid
          staking protocols.


          * Smart contract security

            There is an inherent risk that Lido could contain a smart contract vulnerability or bug. The Lido code is open-sourced, audited and covered by an extensive bug bounty program to minimise this risk. To mitigate smart contract risks, all of the core Lido contracts are audited. Audit reports can be found [here](https://github.com/lidofinance/audits#lido-protocol-audits). Besides, Lido is covered with a massive [Immunefi bug bounty program](https://immunefi.com/bounty/lido/).
          * Slashing risk

            Validators risk staking penalties, with up to 100% of staked funds at risk if validators fail. To minimise this risk, Lido stakes across multiple professional and reputable node operators with heterogeneous setups, with additional mitigation in the form of self-coverage.
          * stToken price risk

            Users risk an exchange price of stTokens which is lower than inherent value due to withdrawal restrictions on Lido, making arbitrage and risk-free market-making impossible. The Lido DAO is driven to mitigate the above risks and eliminate them entirely to the extent possible. Despite this, they may still exist and, as such, it is our duty to communicate them.

          The Lido DAO is driven to mitigate the above risks and eliminate them entirely to the extent possible. Despite this, they may still exist.
        questionId: qID
      - question: What is Lido staking APR for Ethereum?
        answer: >-
          Lido staking APR for Ethereum = Protocol APR * (1 - Protocol fee)


          Protocol APR — the overall Consensus Layer (CL) and Execution Layer (EL) rewards received by Lido validators to total pooled ETH estimated as the moving average of the last seven days.


          Protocol fee — Lido applies a 10% fee on staking rewards that are split between node operators and the DAO Treasury.


          More about Lido staking APR for Ethereum you could find on the [Ethereum landing page](https://lido.fi/ethereum) and in our [Docs](https://docs.lido.fi/#liquid-staking).
        questionId: qID
      - question: What fee is applied by Lido? What is this used for?
        answer:
          The protocol applies a 10% fee on staking rewards. This fee is split
          between node operators and the Lido DAO. That means the users receive
          90% of the staking rewards returned by the networks.
        questionId: qID
      - question: What is stETH?
        answer:
          stETH is a transferable rebasing utility token representing a share of
          the total ETH staked through the protocol, which consists of user
          deposits and staking rewards. Because stETH rebases daily, it
          communicates the position of the share daily.
        questionId: qID
      - answer:
          You can get stETH many ways, including interacting with the smart
          contract directly.Yet, it is much easier to use a [Lido Ethereum
          staking widget](https://stake.lido.fi/) and in other [DEX Lido
          integrations](https://lido.fi/lido-ecosystem?tokens=stETH&categories=Get).
        question: How can I get stETH?
        questionId: qID
      - answer: You can use your stETH as collateral, for lending,
          and [more](https://lido.fi/lido-ecosystem).
        question: How can I use stETH?
        questionId: qID
      - answer: >-
          There are multiple coverage and insurer providers with different
          products for stETH:


          * [Bridge Mutual](https://bridgemutual.io/)

          * [Idle Finance](https://idle.finance/)

          * [Nexus Mutual](https://nexusmutual.io/)

          * [Ribbon Finance](https://app.ribbon.finance/)

          * [Chainproof](https://www.chainproof.co/)


          Check with providers for coverage and insurer conditions.
        question: Where can I cover my stETH?
        questionId: qID
      - answer: You can use our [Withdrawals Request and Claim
          tabs](https://stake.lido.fi/withdrawals/claim) to unstake stETH and
          receive ETH at a 1:1 ratio. Under normal circumstances, withdrawal
          period can take anywhere between 1-5 days. After that, you can claim
          your ETH using the Claim tab. Also, you can exchange stETH on [DEX
          Lido
          integrations](https://lido.fi/lido-ecosystem?tokens=stETH&categories=Get).
        question: How can I unstake stETH?
        questionId: qID
  - identification: wrap
    faq:
      - answer:
          wstETH (wrapped stETH) is a non-rebasing version of stETH. Unlike the
          stETH balance, which updates every day and communicates your share of
          rewards, the wstETH balance stays the same while the stETH balance
          updates inside the wrapper daily.
        question: What is wstETH?
        questionId: qID
      - answer:
          You can wrap your stETH or ETH tokens using [Wrap & Unwrap staking
          widget](https://stake.lido.fi/wrap) or [DEX Lido
          integrations](https://lido.fi/lido-ecosystem?tokens=wstETH&categories=Get)
        question: How can I get wstETH?
        questionId: qID
      - answer: wstETH is useful
          across [L2](https://lido.fi/lido-ecosystem?networks=arbitrum%2Coptimism) and
          other [DeFi protocols](https://lido.fi/lido-ecosystem?tokens=wstETH),
          which are based on constant balance tokens.
        question: How can I use wstETH?
        questionId: qID
      - answer:
          Yes, wrapped stETH gets staking rewards at the same rate as regular
          stETH. When you keep your stETH in a wrapper you cannot see your daily
          staking rewards. However, when you unwrap your wstETH your new stETH
          balance will have increased relative to pre-wrapped amount to reflect
          your received rewards.
        question: Do I get my staking rewards if I wrap stETH to wstETH?
        questionId: qID
      - answer: No, staking rewards accrue to wstETH automatically.
        question: Do I need to claim my staking rewards if I wrap stETH to wstETH?
        questionId: qID
      - answer: You can unwrap your wstETH tokens using [Wrap & Unwrap staking
          widget](https://stake.lido.fi/wrap/unwrap).
        question: How could I unwrap wstETH back to stETH?
        questionId: qID
      - answer:
          No, you can transform your wstETH to ETH using the [Withdrawals Request
          and Claim tabs](https://stake.lido.fi/withdrawals). Note that, under
          the hood, wstETH will unwrap to stETH first, so your request will be
          denominated in stETH.
        question: Do I need to unwrap my wstETH before requesting withdrawals?
        questionId: qID
  - identification: withdrawals
    faq:
      - answer:
          Users can unstake their stETH or wstETH through withdrawals. Upon
          unstaking stETH, they will receive ETH at a 1:1 ratio. When unstaking
          wstETH, the unwrapping process will take place seamlessly in the
          background.
        question: What are withdrawals?
        questionId: qID
      - answer: >-
          The withdrawal process is simple and has two steps:


          1. **Request withdrawal**: Lock your stETH/wstETH by issuing a withdrawal request. ETH is sourced to fulfill the request, and then locked stETH is burned, which marks the withdrawal request as claimable. Under normal circumstances, this can take anywhere between 1-5 days.

          2. **Claim**: Claim your ETH after the withdrawal request has been processed.
        question: How does the withdrawal process work?
        questionId: qID
      - answer:
          Press the [Request tab](https://stake.lido.fi/withdrawals/request),
          choose an amount of stETH/wstETH to withdraw, then press ‘Request
          withdrawal’. Confirm the transaction using your wallet and press
          ‘Claim’ on the [Claim
          tab](https://stake.lido.fi/withdrawals/claim) once it is ready.
        question: How do I withdraw?
        questionId: qID
      - answer: Yes. Stakers can transform their stETH to ETH 1:1 using
          the [Request](https://stake.lido.fi/withdrawals/request) and [Claim](https://stake.lido.fi/withdrawals/claim) tabs.
        question: Can I transform my stETH to ETH?
        questionId: qID
      - answer: Yes. You can transform your wstETH to ETH using
          the [Request](https://stake.lido.fi/withdrawals/request) and [Claim](https://stake.lido.fi/withdrawals/claim) tabs.
          Note that, under the hood, wstETH will unwrap to stETH first, so your
          request will be denominated in stETH.
        question: Can I transform my wstETH to ETH?
        questionId: qID
      - answer:
          When you request to withdraw wstETH, it is automatically unwrapped into
          stETH, which then gets transformed into ETH. The main withdrawal
          period is when stETH is transformed into ETH. That's why you see the
          amount pending denominated in stETH.
        question:
          When I try to withdraw wstETH, why do I see the stETH amount in my
          request?
        questionId: qID
      - answer:
          Under normal circumstances, the stETH/wstETH withdrawal period can take
          anywhere between 1-5 days. After that, you can claim your ETH using
          the [Claim tab](https://stake.lido.fi/withdrawals/claim).
        question: How long does it take to withdraw?
        questionId: qID
      - answer: |-
          * The amount of stETH in the queue.
          * Perfomance of the validator poolside.
          * Exit queue on the Beacon chain.
          * Demand for staking and unstaking.
        question: What are the factors affecting the withdrawal time?
        questionId: qID
      - answer:
          No. After you request a withdrawal, the stETH/wstETH submitted for
          unstaking will not receive staking rewards on top of your submitted
          balance.
        question: Do I still get rewards after I withdraw?
        questionId: qID
      - answer:
          There’s no withdrawal fee, but as with any Ethereum interaction, there
          will be a network gas fee. Lido does not collect a fee when you
          request a withdrawal.
        question: Is there a fee for withdrawal?
        questionId: qID
      - answer:
          The amount you can claim may differ from your initial request due to a
          slashing occurrence and penalties. For these reasons, the total
          claimable reward amount could be reduced.
        question: Why is the claimable amount may differ from my requested amount?
        questionId: qID
      - answer:
          Turbo mode is a default mode used unless an emergency event affects the
          Ethereum network. In Turbo Mode, withdrawal requests are fulfilled
          quickly, using all available ETH from user deposits and rewards.
        question: What is Turbo mode?
        questionId: qID
      - answer: >-
          Bunker mode is an emergency mode that activates under three worst-case
          conditions (when penalties are large enough to significantly impact
          the protocol’s rewards).


          Importantly, Bunker mode allows for orderly withdrawals to be still processed, albeit more slowly, during chaotic tail-risk scenarios (e.g. mass slashings or a significant portion of validators going offline).
        question: What is Bunker mode?
        questionId: qID
      - answer: >-
          Bunker mode is triggered under three conditions when the penalties
          might be big enough to have a significant impact on the protocol’s
          rewards:


          1. Mass slashing.

          2. Penalties exceeding rewards in the current period between two Oracle reports.

          3. Lower than expected Lido validators' performance in the current period between two Oracle reports and penalties exceeding rewards at the end of it.
        question: What scenarios can cause Bunker mode?
        questionId: qID
      - answer: >-
          Slashing is a penalty that affects validators for intentional or
          accidental misbehavior.


          Mass slashing event is when slashing penalties are big enough to have the impact on Protocol's rewards in the current frame or in the future, esp. midterm penalties.


          Slashing penalties are spread across stakers and may lower your total reward amount. For more information, check out [What Are Staking/Validator Penalties](https://help.lido.fi/en/articles/5232780-what-are-staking-validator-penalties).
        question: What is slashing?
        questionId: qID
      - answer:
          Most often, the stETH/wstETH withdrawal period will be from 1-5 days.
          However, if any scenarios cause Bunker mode to happen, this could be
          extended.
        question:
          If Bunker mode happens when I’ve already submitted a withdrawal
          request, do I need to wait longer?
        questionId: qID
      - answer: >-
          Request size should be at least 100 wei (in stETH), and at
          most 1,000 stETH.


          If you want to withdraw more than 1,000 stETH, your withdrawal request will be split into several requests, but you will still only pay one transaction fee.
        question: Is there any minimum or maximum amount of stETH/wstETH I can withdraw?
        questionId: qID
      - answer: "Each withdrawal request is represented by an NFT: the NFT is
          automatically minted for you when you send a request. You will need to
          add it to your wallet to be able to monitor the request status. When
          the request is ready for the claim, the NFT will change it's
          appearance."
        question: What is Lido NFT?
        questionId: qID
      - answer: >-
          Different wallets have specific functionality for adding and working
          with NFT. Most often, you need to find the specific NFT Address and
          Token ID. These parameters you can find on Etherscan. Visit Etherscan,
          add your wallet, and locate the NFT transaction. Once located, open
          the NFT transaction, and you will see the Address and Token ID.


          If you are a MetaMask user, use [this guide](https://help.lido.fi/en/articles/7858367-how-do-i-add-the-lido-nft-to-metamask).
        question: How do I add the Lido NFT to my wallet?
        questionId: qID
      - answer:
          Maybe your wallet doesn’t support the automatic changing of the NFT
          view. To renew the NFT, you can import the Address and Token ID of
          your NFT, and it could change it's appearance to a new “Ready to
          claim” one.
        question:
          What could be the reason why my NFT's view did not update even though
          my request was ready to be claimed?
        questionId: qID
---
