import { DEFAULT_CLAIMS, DEFAULT_STAKERS } from '../../config/terra';

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const REWARDS_KEY = 'claimedRewardsV5';
const STAKERS_KEY = 'stakers';
const DEFAULT_TAIL_LENGTH = 20;

export class TerraStakingAprStatsStorage {
  _stakers = [];
  _claimedRewards = [];

  constructor(cfStorage, opts = {}) {
    this.cfStorage = cfStorage;
    this._tailLength = opts.tailLength || DEFAULT_TAIL_LENGTH;
    this._claimedRewards = opts.defaultClaims || DEFAULT_CLAIMS;
    this._stakers = opts.defaultStakers || DEFAULT_STAKERS;
    this._updateCurrentValue();
  }

  get stakers() {
    return { ...this._stakers };
  }

  get lastBlock() {
    return { ...this._claimedRewards.lastBlock };
  }

  set lastBlock(value) {
    this._claimedRewards.lastBlock = value;
  }

  addStakers(newStakers) {
    this._stakers.count += newStakers.length;
    this._stakers.lastCounted = newStakers[newStakers.length - 1];
  }

  addClaimedRewards(newClaimedRewards) {
    this._claimedRewards.amount += newClaimedRewards.reduce(
      (sum, claimReward) => sum + claimReward.amount,
      0,
    );

    this._claimedRewards.tail = [
      ...this._claimedRewards.tail,
      ...newClaimedRewards,
    ].slice(-this._tailLength);

    if (this._claimedRewards.tail.length > 0) {
      this._claimedRewards.lastBlock =
        this._claimedRewards.tail[this._claimedRewards.tail.length - 1].block;
    }
  }

  async sync() {
    await Promise.all([this.syncStakers(), this.syncClaimedRewards()]);
  }

  async syncStakers() {
    const kvStakers = await this.cfStorage.get(STAKERS_KEY);
    if (kvStakers && kvStakers.count >= this._stakers.count) {
      this._stakers = kvStakers;
    } else {
      await this.cfStorage.put(STAKERS_KEY, JSON.stringify(this._stakers));
    }
    this._updateCurrentValue();
  }

  async syncClaimedRewards() {
    const kvClaimedRewards = await this.cfStorage.get(REWARDS_KEY);
    if (
      kvClaimedRewards &&
      kvClaimedRewards.lastBlock.height >= this.lastBlock.height
    ) {
      this._claimedRewards = kvClaimedRewards;
    } else {
      await this.cfStorage.put(
        REWARDS_KEY,
        JSON.stringify(this._claimedRewards),
      );
    }
    this._updateCurrentValue();
  }

  _updateCurrentValue() {
    const { totalStaked, lunaPrice } =
      this._claimedRewards.tail[this._claimedRewards.tail.length - 1];

    this.currentValue = {
      apr: calculateAverageApr(this._claimedRewards.tail).toFixed(2),
      stakersCount: this._stakers.count,
      updatedAt: this._claimedRewards.lastBlock.time,
      totalStaked: [
        formatAmount(totalStaked, 'uluna'),
        formatAmount(totalStaked * lunaPrice, 'uusd'),
      ],
      totalReward: [
        formatAmount(this._claimedRewards.amount / lunaPrice, 'uluna'),
        formatAmount(this._claimedRewards.amount, 'uusd'),
      ],
    };
  }
}

function formatAmount(amount, denom) {
  const multiplier = 1000000;
  return { amount: (amount / multiplier).toFixed(2), denom };
}

function sum(items) {
  return items.reduce((total, c) => total + Number(c), 0);
}

function dateToTs(date) {
  return new Date(date).getTime();
}

function calculateAverageApr(claimedRewards) {
  if (claimedRewards.length < 2) {
    return 0;
  }
  const n = claimedRewards.length;
  const averageStaked =
    sum(claimedRewards.map((r) => r.lunaPrice * r.totalStaked)) / n;
  const amountInMs =
    sum(claimedRewards.map((r) => r.amount)) /
    (dateToTs(claimedRewards[n - 1].block.time) -
      dateToTs(claimedRewards[0].block.time));

  return (100 * (amountInMs * ONE_YEAR)) / averageStaked;
}
