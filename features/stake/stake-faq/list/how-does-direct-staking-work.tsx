import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { getPrettyChainName, useDappStatus } from 'modules/web3';
import { config } from 'config';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

export const HowDoesDirectStakingWork: FC = () => {
  const { isChainIdOnL2, chainId } = useDappStatus();
  const chainName = getPrettyChainName(chainId);

  if (!isChainIdOnL2) return null;

  return (
    <Accordion
      summary={`How does Direct Staking on ${chainName} work?`}
      onClick={() => {
        trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.faqHowDoesDirectStakingWork);
      }}
    >
      <p>
        Direct Staking allows you to stake ETH on {chainName} and receive wstETH
        on the same network, without bridging your tokens to Ethereum and back.
      </p>

      <p>
        When you stake, your ETH is exchanged for wstETH from a liquidity pool
        on {chainName}. The exchange rate is determined by a Chainlink price
        feed.
      </p>

      <p>
        The ETH accumulated in the pool is periodically sent to Ethereum via
        Chainlink CCIP, staked through the Lido protocol, and the resulting
        wstETH is bridged back to {chainName} to replenish the pool. The pool
        holds liquidity equivalent to 25 stETH and is replenished automatically
        once its balance reaches a set threshold.
      </p>

      <p>
        If the amount you want to stake exceeds the liquidity available in the
        pool, you can stake a smaller amount or wait until the pool is
        replenished.
      </p>

      <p>
        Please note that Direct Staking relies on third-party infrastructure,
        including Chainlink CCIP and price feeds, which may involve additional
        risks. For further information, please read the{' '}
        <a
          href={`${config.rootOrigin}/terms-of-use`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Use
        </a>
        . You can find more technical details in the{' '}
        <a
          href="https://docs.chain.link/quickstarts/ccip-direct-staking"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chainlink documentation
        </a>
        .
      </p>
    </Accordion>
  );
};
