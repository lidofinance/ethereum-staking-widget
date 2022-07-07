import { CHAINS } from '@lido-sdk/constants';
import { getRpcJsonUrls, HEALTHY_RPC_SERVICES_ARE_OVER } from 'config';
import { serverLogger } from './serverLogger';
import { getStaticRpcBatchProvider } from './RPCProviders';

export const getEthApr = async (): Promise<string> => {
  serverLogger.debug('Getting eth apr...');
  const urls = getRpcJsonUrls(CHAINS.Mainnet);

  const ethApr = calculateStakingRewards({
    totalAtStake: await getTotalAtStakeWithFallbacks(urls),
  });

  serverLogger.debug('Eth apr: ' + ethApr);

  return (ethApr * 1e11).toFixed(1);
};

const getTotalAtStakeWithFallbacks = async (
  urls: Array<string>,
  urlIndex = 0,
): Promise<number> => {
  serverLogger.debug('Fetching currently deposited eth2...');
  const eth2DepositContractAddress =
    '0x00000000219ab540356cBB839Cbe05303d7705Fa';

  try {
    const chainId = CHAINS.Mainnet;

    const staticProvider = getStaticRpcBatchProvider(chainId, urls[urlIndex]);

    const currentlyDeposited = await staticProvider.getBalance(
      eth2DepositContractAddress,
    );

    serverLogger.debug('Currently deposited in eth2: ', +currentlyDeposited);

    return Number(currentlyDeposited);
  } catch {
    if (urlIndex >= urls.length - 1) {
      const error = `[getEthApr] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      throw new Error(error);
    }
    return await getTotalAtStakeWithFallbacks(urls, urlIndex + 1);
  }
};

export interface CalculateStakingRewardsParams {
  slotTimeInSec?: number;
  slotsInEpoch?: number;
  baseRewardFactor?: number;
  totalAtStake?: number; // ETH
  averageNetworkPctOnline?: number;
  vaildatorUptime?: number;
  validatorDeposit?: number; // ETH
  effectiveBalanceIncrement?: number; // gwei
  weightDenominator?: number;
  proposerWeight?: number;
}

const calculateStakingRewards = ({
  slotTimeInSec = 12,
  slotsInEpoch = 32,
  baseRewardFactor = 64,
  totalAtStake = 1_000_000, // ETH
  averageNetworkPctOnline = 0.95,
  vaildatorUptime = 0.99,
  validatorDeposit = 32, // ETH
  effectiveBalanceIncrement = 1_000_000_000, // gwei
  weightDenominator = 64,
  proposerWeight = 8,
}: CalculateStakingRewardsParams): number => {
  // Calculate number of epochs per year
  const avgSecInYear = 31556908.8; // 60 * 60 * 24 * 365.242
  const epochPerYear = avgSecInYear / (slotTimeInSec * slotsInEpoch);
  const baseRewardPerIncrement =
    (effectiveBalanceIncrement * baseRewardFactor) /
    (totalAtStake * 10e8) ** 0.5;

  // Calculate base reward for full validator (in gwei)
  const baseGweiRewardFullValidator =
    ((validatorDeposit * 10e8) / effectiveBalanceIncrement) *
    baseRewardPerIncrement;

  // Calculate offline per-validator penalty per epoch (in gwei)
  // Note: Inactivity penalty is not included in this simple calculation
  const offlineEpochGweiPentalty =
    baseGweiRewardFullValidator *
    ((weightDenominator - proposerWeight) / weightDenominator);

  // Calculate online per-validator reward per epoch (in gwei)
  const onlineEpochGweiReward =
    baseGweiRewardFullValidator * averageNetworkPctOnline;

  // Calculate net yearly staking reward (in gwei)
  const reward = onlineEpochGweiReward * vaildatorUptime;
  const penalty = offlineEpochGweiPentalty * (1 - vaildatorUptime);
  const netRewardPerYear = epochPerYear * (reward - penalty);

  // Return net yearly staking reward percentage
  return netRewardPerYear / 10e8 / validatorDeposit;
};
