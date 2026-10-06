import { BACKEND_SCHEMA } from './backend';
import { formatWEI } from 'features/rewards/utils/numberFormatting';

const TX_HASH =
  '0xfcf2fe53c61b4059c4639a2a2457d0f5287b5ddfe86ec002f2207be8acc34714';

// Shapes as served by the legacy reward-history-backend (stake.lido.fi)
const legacyReward = {
  id: '0xf6a52656c1c9d2cff097af57e761e7a32739ff0be515dcd62cc0098f932cb58c',
  totalPooledEtherBefore: '9846103704697965618834376',
  totalPooledEtherAfter: '9827545658005876910018163',
  totalSharesBefore: '7905020117034760193328819',
  totalSharesAfter: '7889641846195804832870965',
  apr: '2.215082756359648118',
  block: '26126137',
  blockTime: '1791202931',
  logIndex: '54',
  epochDays: '20731.515405092592592593',
  epochFullDays: '20731',
  type: 'reward',
  reportShares: '9366925588188844',
  balance: '11667689191424523',
  rewards: '708036404801',
  change: '708036404801',
  currencyChange: '0.0019294731925523948928811537805',
};

const legacyTransfer = {
  from: '0xff002dae4b9a24a4512d89a9793a1ea794bc8c63',
  to: '0x87c0e047f4e4d3e289a56a36570d4cb957a37ef1',
  value: '10000000000000000',
  shares: '9366925588188844',
  sharesBeforeDecrease: '51186642774621760',
  sharesAfterDecrease: '41819717186432916',
  sharesBeforeIncrease: '0',
  sharesAfterIncrease: '9366925588188844',
  totalPooledEther: '3225506652168327843060191',
  totalShares: '3021308079506884487101999',
  balanceAfterDecrease: '44646150748934291',
  balanceAfterIncrease: '9999999999999999',
  block: '14563166',
  blockTime: '1649663570',
  transactionHash: TX_HASH,
  transactionIndex: '62',
  logIndex: '104',
  epochDays: '19093.328356481481481481',
  epochFullDays: '19093',
  direction: 'in',
  type: 'transfer',
  balance: '9999999999999999',
  change: '10000000000000000',
  currencyChange: '32.09128726408381',
};

const legacyResponse = {
  events: [legacyReward, legacyTransfer],
  totals: {
    ethRewards: '1667689191424524',
    currencyRewards: '3.8223071063371417101176692334967',
  },
  averageApr: '3.430743955846298312',
  ethToStEthRatio: 1.000506246155492,
  stETHCurrencyPrice: { eth: 0.99949401, usd: 2714.84 },
  totalItems: 1638,
};

// Shape served by the lido-rewards-indexer compat route without a price feed
const indexerResponse = {
  events: [
    {
      type: 'reward',
      direction: null,
      change: '6008340206066',
      changeShares: '0',
      balance: '114593779091699102',
      balanceShares: '110999842223309963',
      shareRate: '1032377855647387688870049630',
      apr: '1.913855344974195904',
      block: '3757223',
      blockTime: '1791203592',
      transactionHash: TX_HASH,
      logIndex: '39',
      reportTimestamp: '1791201804',
      preTotalShares: '2259880833000602060093607',
      currencyChange: '',
    },
    {
      type: 'withdrawal',
      direction: 'out',
      change: '5000000000000000',
      changeShares: '4800000000000000',
      balance: '0',
      balanceShares: '0',
      shareRate: '1032377855647387688870049630',
      apr: null,
      block: '3757000',
      blockTime: '1791200000',
      transactionHash: TX_HASH,
      logIndex: '12',
      reportTimestamp: null,
      currencyChange: '',
    },
  ],
  totals: { ethRewards: '3593779091699103', currencyRewards: '' },
  averageApr: '2.036983151493879198',
  ethToStEthRatio: null,
  stETHCurrencyPrice: {},
  totalItems: 3399,
};

describe('BACKEND_SCHEMA', () => {
  it('accepts the legacy backend response and keeps totals as strings', () => {
    const parsed = BACKEND_SCHEMA.parse(legacyResponse);
    expect(parsed.totals).toEqual(legacyResponse.totals);
    expect(parsed.events).toHaveLength(2);
  });

  it('accepts the indexer response without a price feed', () => {
    const parsed = BACKEND_SCHEMA.parse(indexerResponse);
    expect(parsed.totals).toEqual({
      ethRewards: '3593779091699103',
      currencyRewards: '',
    });
    expect(parsed.ethToStEthRatio).toBeNull();
    expect(parsed.stETHCurrencyPrice).toEqual({});
    expect(parsed.events[0]).toMatchObject({ type: 'reward', direction: null });
    expect(parsed.events[1]).toMatchObject({
      type: 'withdrawal',
      direction: 'out',
      apr: null,
    });
  });

  it('discriminates reward and transfer events', () => {
    const [reward, transfer] = BACKEND_SCHEMA.parse(legacyResponse).events;
    expect(reward).toMatchObject({
      type: 'reward',
      apr: '2.215082756359648118',
      reportShares: '9366925588188844',
      totalSharesAfter: '7889641846195804832870965',
    });
    expect(reward.transactionHash).toBeUndefined();
    expect(transfer).toMatchObject({
      type: 'transfer',
      direction: 'in',
      transactionHash: TX_HASH,
      value: '10000000000000000',
    });
  });

  it('keeps a 1000+ ETH reward total renderable by the wei formatter', () => {
    const ethRewards = '1000000000000000000000'; // 1e21 wei, Number() -> "1e+21"
    const parsed = BACKEND_SCHEMA.parse({
      ...legacyResponse,
      totals: { ...legacyResponse.totals, ethRewards },
    });
    expect(parsed.totals.ethRewards).toBe(ethRewards);
    expect(formatWEI(parsed.totals.ethRewards)).toBe('1000.00000000');
    expect(formatWEI(parsed.totals.ethRewards, true)).toBe(
      '1000.000000000000000000',
    );
  });

  it('keeps wei precision beyond the safe integer range', () => {
    const ethRewards = '12345678901234567890';
    const parsed = BACKEND_SCHEMA.parse({
      ...legacyResponse,
      totals: { ...legacyResponse.totals, ethRewards },
    });
    expect(parsed.totals.ethRewards).toBe(ethRewards);
  });

  it('accepts a negative reward change', () => {
    const parsed = BACKEND_SCHEMA.parse({
      ...legacyResponse,
      events: [{ ...legacyReward, change: '-708036404801', rewards: '-1' }],
      totals: { ...legacyResponse.totals, ethRewards: '-5' },
    });
    expect(parsed.events[0].change).toBe('-708036404801');
    expect(parsed.totals.ethRewards).toBe('-5');
  });

  it.each([
    ['numeric value', 5],
    ['non-numeric string', 'abc'],
    ['exponent notation', '1e21'],
    ['decimal wei', '1.5'],
    ['empty string', ''],
  ])('rejects ethRewards as %s', (_, ethRewards) => {
    expect(() =>
      BACKEND_SCHEMA.parse({
        ...legacyResponse,
        totals: { ...legacyResponse.totals, ethRewards },
      }),
    ).toThrow();
  });

  it('rejects an event of unknown type', () => {
    expect(() =>
      BACKEND_SCHEMA.parse({
        ...legacyResponse,
        events: [{ ...legacyReward, type: 'rebase' }],
      }),
    ).toThrow();
  });

  it('rejects a transfer without direction or transaction hash', () => {
    const { direction: _d, ...noDirection } = legacyTransfer;
    const { transactionHash: _h, ...noHash } = legacyTransfer;
    expect(() =>
      BACKEND_SCHEMA.parse({ ...legacyResponse, events: [noDirection] }),
    ).toThrow();
    expect(() =>
      BACKEND_SCHEMA.parse({ ...legacyResponse, events: [noHash] }),
    ).toThrow();
  });

  it('rejects non-wei event amounts', () => {
    expect(() =>
      BACKEND_SCHEMA.parse({
        ...legacyResponse,
        events: [{ ...legacyReward, balance: '1e18' }],
      }),
    ).toThrow();
  });

  it('rejects a response with missing totals', () => {
    const { totals: _, ...noTotals } = legacyResponse;
    expect(() => BACKEND_SCHEMA.parse(noTotals)).toThrow();
  });
});
