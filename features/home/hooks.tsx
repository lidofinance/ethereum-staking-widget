import { SWRResponse, useEthereumBalance } from '@lido-sdk/react';
import { useConnectorInfo } from '@lido-sdk/web3-react';
import { BigNumber } from 'ethers';
import { isDesktop } from 'react-device-detect';
import { useStakingLimitInfo } from 'shared/hooks';
import { bnMin } from 'utils';

export const useStakeableEther = (): Pick<
  SWRResponse<BigNumber>,
  'data' | 'initialLoading'
> => {
  const ethereumBalance = useEthereumBalance();
  const stakingLimitInfo = useStakingLimitInfo();

  return {
    initialLoading:
      ethereumBalance.initialLoading && stakingLimitInfo.initialLoading,
    data:
      ethereumBalance.data && stakingLimitInfo.data?.isStakingLimitSet
        ? bnMin(ethereumBalance.data, stakingLimitInfo.data.currentStakeLimit)
        : ethereumBalance.data,
  };
};

const ONE_INCH_URL = 'https://app.1inch.io/#/1/swap/ETH/steth';
const LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK = 'ledgerlive://discover/1inch-lld';
// doesn't work for now
// const LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK = 'ledgerlive://discover/1inch-llm';

export const use1inchLink = () => {
  const { isLedgerLive } = useConnectorInfo();

  let link = ONE_INCH_URL;
  let linkTarget = '_blank';

  const openInLedgerLive = isLedgerLive && isDesktop;
  if (openInLedgerLive) {
    link = LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK;
    linkTarget = '_self';
  }

  return {
    link,
    linkTarget,
  };
};
