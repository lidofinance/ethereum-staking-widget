import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { getRpcJsonUrls, HEALTHY_RPC_SERVICES_ARE_OVER } from 'config';
import { rpcResponseTime, INFURA, ALCHEMY } from 'utils/metrics';

export const getEthApr = async (): Promise<string> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);

  const ethApr = calculateEth2Rewards({
    totalAtStake: await getTotalAtStakeWithFallbacks(urls, 0),
  });

  return (ethApr * 1e11).toFixed(1);
};

const getTotalAtStakeWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<number> => {
  const eth2DepositContractAddress =
    '0x00000000219ab540356cBB839Cbe05303d7705Fa';

  try {
    const staticProvider = getStaticRpcBatchProvider(
      CHAINS.Mainnet,
      urls[urlIndex],
    );

    const endMetric = rpcResponseTime.startTimer();

    const currentlyDeposited = await staticProvider.getBalance(
      eth2DepositContractAddress,
    );

    if (urls[urlIndex].indexOf(INFURA) > -1) {
      console.log('[getEthApr] Get via infura');
      endMetric({ provider: INFURA });
    }
    if (urls[urlIndex].indexOf(ALCHEMY) > -1) {
      console.log('[getEthApr] Get via alchemy');
      endMetric({ provider: ALCHEMY });
    }

    return Number(currentlyDeposited);
  } catch {
    if (urlIndex >= urls.length - 1) {
      const error = `[getEthApr] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      throw new Error(error);
    }
    return await getTotalAtStakeWithFallbacks(urls, urlIndex + 1);
  }
};

const calculateEth2Rewards = ({
  slotTimeInSec = 12,
  slotsInEpoch = 32,
  baseRewardFactor = 64,
  totalAtStake = 1000000,
  baseRewardsPerEpoch = 4,
  baseRewardsPropotionalValidators = 3,
  averageNetworkPctOnline = 0.95,
  oneSlotLatePenalty = 0.0156,
  vaildatorUptime = 0.99,
  validatorDeposit = 32,
}) => {
  // Calculate number of epochs per year
  const avgSecInYear = 31556908.8; // 60 * 60 * 24 * 365.242
  const epochPerYear = avgSecInYear / (slotTimeInSec * slotsInEpoch);

  // Calculate base reward for full validator (in gwei)
  const baseGweiRewardFullValidator =
    (32 * 10e8 * baseRewardFactor) /
    (totalAtStake * 10e8) ** 0.5 /
    baseRewardsPerEpoch;

  // Calculate offline per-validator penalty per epoch (in gwei)
  const offlineEpochGweiPentalty = baseGweiRewardFullValidator * 4;

  // Calculate online per-validator reward per epoch (in gwei)
  const fullUptimeValidatorRewards =
    baseGweiRewardFullValidator *
    baseRewardsPropotionalValidators *
    averageNetworkPctOnline;
  const oneEighthReward =
    0.125 * baseGweiRewardFullValidator * averageNetworkPctOnline;
  const rewardAdjModifier =
    averageNetworkPctOnline +
    averageNetworkPctOnline *
      (1 - averageNetworkPctOnline) *
      (1 - oneSlotLatePenalty) +
    averageNetworkPctOnline *
      (1 - averageNetworkPctOnline) ** 2 *
      (1 - 2 * oneSlotLatePenalty);
  const sevenEighthsReward =
    0.875 * baseGweiRewardFullValidator * rewardAdjModifier;
  const onlineEpochGweiReward =
    fullUptimeValidatorRewards + oneEighthReward + sevenEighthsReward;

  // Calculate net yearly staking reward (in gwei)
  const reward = onlineEpochGweiReward * vaildatorUptime;
  const penalty = offlineEpochGweiPentalty * (1 - vaildatorUptime);
  const netRewardPerYear = epochPerYear * (reward - penalty);

  // Return net yearly staking reward percentage
  return netRewardPerYear / 10e8 / validatorDeposit;
};
