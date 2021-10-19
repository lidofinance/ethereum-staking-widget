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

  async getValidators(paginationKey) {
    const queryParams = paginationKey
      ? { 'pagination.key': paginationKey }
      : {};
    return this._request('cosmos/staking/v1beta1/validators', queryParams);
  }

  async getAllValidators() {
    let paginationKey = '';
    let iteration = 0;
    const out = [];

    while (paginationKey !== null && iteration < 10) {
      // prevent infinite loop, next_key may be broken for some reason
      iteration++;
      const { validators, pagination } = await this.getValidators(
        paginationKey,
      );
      paginationKey = pagination.next_key;
      out.push(...validators);
    }

    return out;
  }

  async getContractWhiteList(contract, version = 1, height) {
    if (version === 1) {
      const data = await this._request(`wasm/contracts/${contract}/store`, {
        query_msg: { whitelisted_validators: {} },
        ...(height && { height }),
      });

      return data.result.validators;
    }

    if (version === 2) {
      const data = await this._request(`wasm/contracts/${contract}/store`, {
        query_msg: { get_validators_for_delegation: {} },
        ...(height && { height }),
      });

      return data.result.map((one) => one.address);
    }

    throw new Error(`Can't get contract white list with version=${version}`);
  }

  async getValidatorsWithBalances({
                                    hubContract,
                                    validatorsContract,
                                    version = 1,
                                  }) {
    const [validators, delegations, whiteList] = await Promise.all([
      this.getAllValidators(),
      this.getDelegations(hubContract),
      this.getContractWhiteList(validatorsContract, version),
    ]);

    const indexedDelegations = delegations.result.reduce(
      (all, one) => (
        all.set(one.delegation.validator_address, one.balance.amount), all
      ),
      new Map(),
    );

    return formatValidators(validators)
      .filter((one) => whiteList.includes(one.address))
      .map((one) => ({
        ...one,
        delegated: indexedDelegations.get(one.address) || '0',
      }));
  }

  async getContractState(contract, height) {
    return this._request(`wasm/contracts/${contract}/store`, {
      query_msg: { state: {} },
      ...(height && { height }),
    });
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

function formatValidators(validators) {
  return validators.map((validator) => ({
    address: validator.operator_address,
    status: validator.status,
    moniker: validator.description.moniker,
    tokens: validator.tokens,
    commission: Number(validator.commission.commission_rates.rate).toFixed(2),
  }));
}
