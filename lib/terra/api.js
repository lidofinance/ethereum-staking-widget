import _ from 'lodash';

const DEFAULT_TERRA_NODE_URL = 'https://lcd.terra.dev/';

export class TerraRESTApi {
  constructor(nodeUrl = DEFAULT_TERRA_NODE_URL) {
    this.nodeUrl = nodeUrl;
  }

  async getStakers(contract, startAfter, limit = 30) {
    const data = await this._request(`wasm/contracts/${contract}/store`, {
      query_msg: { all_accounts: { start_after: startAfter, limit } },
    });

    return data.result.accounts;
  }

  async getLunaPriceInUsd(height) {
    const url = 'oracle/denoms/uusd/exchange_rate';
    const data = await this._request(url, { height });
    return Number(data.result);
  }

  async getTotalStaked(contract, height) {
    let data = await this.getDelegations(contract, height);
    if (!data.result) {
      throw new Error(`Can't get total staked`);
    }
    // Get last delegations if terra node has no data for passed height
    if (data.result.length === 0) {
      data = await this.getDelegations(contract);
    }
    return data.result.reduce(
      (res, current) => res + Number(current.balance.amount),
      0,
    );
  }

  async getDelegations(contract, height) {
    const queryParams = height ? { height } : {};
    return this._request(
      `staking/delegators/${contract}/delegations`,
      queryParams,
    );
  }

  async getLastBlockHeight() {
    const { block } = await this._request(`blocks/latest`);
    return +block.header.height;
  }

  async getBlock(height) {
    const { block } = await this._request(`blocks/${height}`);
    return { height: +block.header.height, time: block.header.time };
  }

  async search(conditions = {}, offset = 0, limit = 10) {
    if (limit > 100) throw new Error(`Limit can't be more than 100`);
    return this._request(`cosmos/tx/v1beta1/txs`, {
      'pagination.limit': limit,
      'pagination.count_total': true,
      events: Object.entries(conditions).reduce(
        (result, [key, value]) => [...result, `${key}='${value}'`],
        [],
      ),
      //   'pagination.key': paginationKey, // doesn't work at all for now
      'pagination.offset': offset,
      order_by: '2', //desc
    });
  }

  _prepareQueryParams(queryParams) {
    const queryString = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (_.isArray(value)) {
        value.forEach((item) => queryString.append(key, item));
      } else {
        queryString.append(
          key,
          _.isObject(value) ? JSON.stringify(value) : value,
        );
      }
    }
    return queryString;
  }

  async _request(relativeURL, queryParams = {}) {
    const queryString = this._prepareQueryParams(queryParams);
    const fullUrl = `${this.nodeUrl}${relativeURL}?${queryString.toString()}`;

    console.log(`Fetching ${fullUrl}`);

    const r = await fetch(fullUrl);
    if (r.ok) {
      return r.json();
    }
    throw new Error(
      `Request ${fullUrl} failed with status ${r.status}. ${await r.text()}`,
    );
  }
}
