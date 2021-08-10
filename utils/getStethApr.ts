import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { CHAINS } from '@lido-sdk/constants';
import {
  getOracleAddress,
  getOracleContractFactory,
  getRpcJsonUrls,
  getStethAddress,
  getStethContractFactory,
} from 'config';

export const getStethApr = async (): Promise<string> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  const library = new JsonRpcProvider(urls[0], CHAINS.Mainnet);

  const oracleAddress = getOracleAddress(CHAINS.Mainnet);
  const oracleContractFactory = getOracleContractFactory();
  const oracleContract = oracleContractFactory.connect(oracleAddress, library);

  const stethAddress = getStethAddress(CHAINS.Mainnet);
  const stethContractFactory = getStethContractFactory();
  const stethContract = stethContractFactory.connect(stethAddress, library);

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

  const stethAprAfterLidoFee = Number(stethApr) * (1 - lidoFeeAsFraction) * 0.1;
  const aprInUserFriendlyFormat = stethAprAfterLidoFee.toFixed(1);

  return aprInUserFriendlyFormat;
};
