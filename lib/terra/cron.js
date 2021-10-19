import asyncPool from 'tiny-async-pool';
import cron from 'node-cron';

import {
  CONCURRENCY_LIMIT,
  CRON_JOB,
  HUB_CONTRACT,
  MAX_REQUESTS_PER_RUN,
  STAKERS_ADDRESS,
} from '../../config/terra';

export class TerraCron {
  running = false;

  constructor(
    statsStorage,
    terraApi,
    {
      hubContract,
      concurrencyLimit,
      cronString,
      maxRequestsPerRun,
      stakersAddress,
    } = {},
  ) {
    this.statsStorage = statsStorage;
    this.terraApi = terraApi;
    this.hubContract = hubContract || HUB_CONTRACT;
    this.concurrencyLimit = concurrencyLimit || CONCURRENCY_LIMIT;
    this.cronString = cronString || CRON_JOB;
    this.maxRequestsPerRun = maxRequestsPerRun || MAX_REQUESTS_PER_RUN;
    this.stakersAddress = stakersAddress || STAKERS_ADDRESS;
  }

  init() {
    console.log(`setup cron ${this.cronString}`);
    cron.schedule(this.cronString, this.cronJob.bind(this));
  }

  async cronJob() {
    if (this.running) return;
    this.running = true;
    try {
      console.log('Update stakers');
      await this._updateStakersCount();
    } catch (e) {
      console.error(e);
    }
    try {
      console.log('Update claimed awards');
      await this._updateClaimedRewards();
    } catch (e) {
      console.error(e);
    }
    this.running = false;
  }

  async _updateClaimedRewards() {
    const maxBatchRequestsPerRun = 2;
    const batchSize = 20000;
    await this.statsStorage.syncClaimedRewards();
    const lastBlockHeight = await this.terraApi.getLastBlockHeight();
    let { height: lastCheckedHeight } = this.statsStorage.lastBlock;
    const blocksAhead = lastBlockHeight - lastCheckedHeight;

    if (blocksAhead < 0) {
      console.log('Rewards are already up to date');
      return;
    }
    const batchesCount = Math.min(
      maxBatchRequestsPerRun,
      Math.floor(blocksAhead / batchSize),
    );
    for (let i = 0; i <= batchesCount; ++i) {
      const minHeight = lastCheckedHeight + 1;
      const maxHeight = Math.min(lastBlockHeight, minHeight + batchSize);
      const newClaimedRewards = await retryOnError(() =>
        this._getClaimedRewards(minHeight, maxHeight, lastBlockHeight),
      );
      if (newClaimedRewards.length > 0) {
        this.statsStorage.addClaimedRewards(newClaimedRewards);
      }
      lastCheckedHeight = maxHeight;
    }
    this.statsStorage.lastBlock = await this.terraApi.getBlock(
      lastCheckedHeight,
    );
    await this.statsStorage.syncClaimedRewards();
  }

  async _getClaimedRewards(minHeight, maxHeight, lastBlockHeight) {
    const limit = 20;
    let out = [];
    let txs = [];
    let totalCount = 0;
    let currentMinHeight = Infinity;
    for (
      let offset = 0;
      (offset + limit < totalCount && currentMinHeight > minHeight) ||
      offset === 0;
      offset += limit
    ) {
      const data = await this.terraApi.search(
        {
          'wasm.action': 'update_global_index',
          'execute_contract.sender': this.hubContract,
        },
        offset,
        limit,
      );
      txs = data.tx_responses.map((tx) => ({
        ...tx,
        amount: extractReward(tx),
      }));
      currentMinHeight = Math.min(...txs.map((tx) => Number(tx.height)));
      totalCount = Number(data.pagination.total);
      const filteredTxs = txs.filter(
        (tx) =>
          tx.height <= maxHeight && tx.height > minHeight && tx.amount > 0,
      );
      out.push(...filteredTxs);
      await new Promise((r) => setTimeout(r(), 1000));
    }

    return asyncPool(this.concurrencyLimit, out.reverse(), async (tx) => {
      const roundedHeight = nearestHeightWithData(tx.height, lastBlockHeight);
      return {
        amount: Number(tx.amount),
        block: {
          height: Number(tx.height),
          time: new Date(tx.timestamp).getTime(),
        },
        lunaPrice: await this.terraApi.getLunaPriceInUsd(roundedHeight),
        totalStaked: await this.terraApi.getTotalStaked(
          this.hubContract,
          roundedHeight,
        ),
      };
    });
  }

  async _updateStakersCount() {
    let currentRequest = 0;
    while (currentRequest < this.maxRequestsPerRun) {
      const stakers = await retryOnError(() =>
        this.terraApi.getStakers(
          this.stakersAddress,
          this.statsStorage.stakers.lastCounted,
        ),
      );
      if (stakers.length === 0) {
        break;
      }
      this.statsStorage.addStakers(stakers);
      currentRequest += 1;
    }

    if (currentRequest > 0) {
      await this.statsStorage.syncStakers();
    }
  }
}

async function retryOnError(handler, maxRequireAttempts = 4) {
  let requestAttempt = 0;
  let lastError;
  while (requestAttempt < maxRequireAttempts) {
    try {
      const res = await handler();
      return res;
    } catch (e) {
      console.log(`Got Error`, e);
      lastError = e;
      requestAttempt += 1;
    }
  }
  throw new Error(
    `Max retries limit exceeded. Last error message: ${lastError.message}`,
  );
}

/**
 * Terra node doesn't store every value for blocks older than everyHeightStoredLimit
 * take data nearest block which has data
 * @param {number} height current height
 * @param {number} lastHeight last height
 * @returns {number}
 */
function nearestHeightWithData(height, lastHeight) {
  const everyHeightStoredLimit = 100;
  const distanceBetweenOldData = 100;

  if (lastHeight - height < everyHeightStoredLimit) {
    return height;
  }

  return distanceBetweenOldData * Math.round(height / distanceBetweenOldData);
}

function extractReward(tx) {
  for (const log of tx.logs) {
    const event = log.events.find((event) => event.type === 'wasm');
    if (event) {
      const attribute = event.attributes.find(
        (attribute) => attribute.key === 'claimed_rewards',
      );
      if (attribute) return attribute.value;
    }
  }
  return 0;
}
