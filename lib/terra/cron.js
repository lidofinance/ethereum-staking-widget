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

  constructor(statsStorage, terraApi) {
    this.statsStorage = statsStorage;
    this.terraApi = terraApi;
  }

  init() {
    cron.schedule(CRON_JOB, this.cronJob.bind(this));
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
    const batchSize = 50000;
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
    const limit = 100;
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
          'execute_contract.sender': HUB_CONTRACT,
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
    }

    return asyncPool(CONCURRENCY_LIMIT, out.reverse(), async (tx) => {
      const roundedHeight = nearestHeightWithData(tx.height, lastBlockHeight);
      return {
        amount: Number(tx.amount),
        block: {
          height: Number(tx.height),
          time: new Date(tx.timestamp).getTime(),
        },
        lunaPrice: await this.terraApi.getLunaPriceInUsd(roundedHeight),
        totalStaked: await this.terraApi.getTotalStaked(
          HUB_CONTRACT,
          roundedHeight,
        ),
      };
    });
  }

  async _updateStakersCount() {
    let currentRequest = 0;
    while (currentRequest < MAX_REQUESTS_PER_RUN) {
      const stakers = await retryOnError(() =>
        this.terraApi.getStakers(
          STAKERS_ADDRESS,
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
