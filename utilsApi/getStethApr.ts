import { BigNumber } from '@ethersproject/bignumber';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getOracleAddress,
  getOracleContractFactory,
  getRpcJsonUrls,
  getStethAddress,
  getStethContractFactory,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { serverLogger } from 'utilsApi';
import { rpcResponseTime, INFURA, ALCHEMY } from 'utilsApi/metrics';

export const getStethApr = async (): Promise<string> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return await getStethAprWithFallbacks(urls, 0);
};

const getStethAprWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<string> => {
  // TODO: MAYBE DEFAULT PROVIDER?
  let provider = INFURA;
  // if (urls[urlIndex].indexOf(INFURA) > -1) {
  //   console.log('[getStethApr] Get via infura');
  //   provider = INFURA;
  // }
  if (urls[urlIndex].indexOf(ALCHEMY) > -1) {
    serverLogger.log('[getStethApr] Get via alchemy');
    provider = ALCHEMY;
  }

  try {
    const staticProvider = getStaticRpcBatchProvider(
      CHAINS.Mainnet,
      urls[urlIndex],
    );

    const oracleAddress = getOracleAddress(CHAINS.Mainnet);
    const oracleContractFactory = getOracleContractFactory();
    const oracleContract = oracleContractFactory.connect(
      oracleAddress,
      staticProvider,
    );

    const stethAddress = getStethAddress(CHAINS.Mainnet);
    const stethContractFactory = getStethContractFactory();
    const stethContract = stethContractFactory.connect(
      stethAddress,
      staticProvider,
    );

    const endMetric1 = rpcResponseTime.startTimer();

    const [postTotalPooledEther, preTotalPooledEther, timeElapsed] =
      await oracleContract.getLastCompletedReportDelta();

    endMetric1({ provider: provider });

    const secondsInYear = BigNumber.from(1000 * 60 * 60 * 24 * 365.25);

    // STETH APR = (postTotalPooledEther - preTotalPooledEther) * secondsInYear / (preTotalPooledEther * timeElapsed)
    // see: https://docs.lido.fi/contracts/lido-oracle#add-calculation-of-staker-rewards-apr
    const stethApr = postTotalPooledEther
      .sub(preTotalPooledEther)
      .mul(secondsInYear)
      .div(preTotalPooledEther.mul(timeElapsed));

    const endMetric2 = rpcResponseTime.startTimer();

    const lidoFee = await stethContract.getFee();

    endMetric2({ provider: provider });

    const oneHundredPercentInBasisPoints = 100 * 100;
    const lidoFeeAsFraction = lidoFee / oneHundredPercentInBasisPoints;

    const stethAprAfterLidoFee =
      Number(stethApr) * (1 - lidoFeeAsFraction) * 0.1;

    return stethAprAfterLidoFee.toFixed(1);
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getStethApr] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      serverLogger.error(error);
      throw new Error(error);
    }
    return await getStethAprWithFallbacks(urls, urlIndex + 1);
  }
};
