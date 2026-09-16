import { getAddress, parseEther } from 'viem';

import { getMellowClaimReward, getMellowUserPointsWei } from './mellow-points';

const VAULT = '0x0000000000000000000000000000000000000d00';
const OTHER = '0x0000000000000000000000000000000000000d01';

const pointsResponse = (user_mellow_points: unknown) => [
  { vault_address: OTHER, user_mellow_points: 'NaN' }, // other vaults may be broken
  { vault_address: VAULT, user_mellow_points },
];

// DVV-DSP-01: malformed point values must fail in the queryFn, never in render
describe('getMellowUserPointsWei', () => {
  it('converts a decimal string to wei without a Number round trip', () => {
    expect(getMellowUserPointsWei(pointsResponse('123.456789'), VAULT)).toBe(
      parseEther('123.456789'),
    );
  });

  it('accepts a numeric value', () => {
    expect(getMellowUserPointsWei(pointsResponse(12.5), VAULT)).toBe(
      parseEther('12.5'),
    );
  });

  it('returns 0 for a new user without a record', () => {
    expect(getMellowUserPointsWei([], VAULT)).toBe(0n);
  });

  it.each(['NaN', 'abc', '1e21', 1e21, '-1', null, undefined, {}])(
    'rejects %p instead of producing an unparseable amount',
    (value) => {
      expect(() =>
        getMellowUserPointsWei(pointsResponse(value), VAULT),
      ).toThrow();
    },
  );

  it('rejects a response that is not a list or has a bad address', () => {
    expect(() => getMellowUserPointsWei({ vaults: [] }, VAULT)).toThrow();
    expect(() =>
      getMellowUserPointsWei(
        [{ vault_address: '0x12', user_mellow_points: '1' }],
        VAULT,
      ),
    ).toThrow();
  });
});

describe('getMellowClaimReward', () => {
  const reward = {
    claimable_amount: '3000',
    claimed_amount: '1000',
    token: { address: OTHER, decimals: 18, price: 2.5, symbol: 'SSV' },
    claim_url: 'https://example.com',
  };

  it('returns the validated reward with a checksummed token address, keeping extra fields', () => {
    const data = { vaults: [{ vault: VAULT, rewards: [reward] }] };
    expect(getMellowClaimReward(data, VAULT)).toMatchObject({
      ...reward,
      token: { ...reward.token, address: getAddress(OTHER) },
    });
  });

  it('returns undefined when the vault has no rewards', () => {
    const data = { vaults: [{ vault: VAULT, rewards: [] }] };
    expect(getMellowClaimReward(data, VAULT)).toBeUndefined();
  });

  it('rejects non-integer amounts', () => {
    const data = {
      vaults: [
        { vault: VAULT, rewards: [{ ...reward, claimable_amount: '1.5' }] },
      ],
    };
    expect(() => getMellowClaimReward(data, VAULT)).toThrow();
  });
});
