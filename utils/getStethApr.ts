import { BigNumber } from '@ethersproject/bignumber';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getOracleAddress,
  getOracleContractFactory,
  getRpcJsonUrls,
  getStethAddress,
  getStethContractFactory,
} from 'config';

export const getStethApr = async (): Promise<string> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return await getStethAprWithFallbacks(urls, 0);
};

const getStethAprWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<string> => {
  // TODO: remove api-key from log
  console.log('[getStethApr] Try get via', urls[urlIndex]);

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

    const [postTotalPooledEther, preTotalPooledEther, timeElapsed] =
      await oracleContract.getLastCompletedReportDelta();

    const secondsInYear = BigNumber.from(1000 * 60 * 60 * 24 * 365.25);

    // STETH APR = (postTotalPooledEther - preTotalPooledEther) * secondsInYear / (preTotalPooledEther * timeElapsed)
    // see: https://docs.lido.fi/contracts/lido-oracle#add-calculation-of-staker-rewards-apr
    const stethApr = postTotalPooledEther
      .sub(preTotalPooledEther)
      .mul(secondsInYear)
      .div(preTotalPooledEther.mul(timeElapsed));

    const lidoFee = await stethContract.getFee();
    const oneHundredPercentInBasisPoints = 100 * 100;
    const lidoFeeAsFraction = lidoFee / oneHundredPercentInBasisPoints;

    const stethAprAfterLidoFee =
      Number(stethApr) * (1 - lidoFeeAsFraction) * 0.1;
    return stethAprAfterLidoFee.toFixed(1);
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      console.log('Healthy RPC services are over! Throw error');
      throw error;
    }
    return await getStethAprWithFallbacks(urls, urlIndex + 1);
  }
};
