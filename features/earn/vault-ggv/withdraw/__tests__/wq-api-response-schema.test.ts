import { WQ_API_RESPONSE_SCHEMA } from '../types';

// Hash from a real API response: the API sends it without 0x
const API_HASH =
  '1dba201b8b77809af43132a8130deea7de8dbfc802d6e9017ad2da2322d4ca7a';
const HASH = `0x${API_HASH}`;
const USER = '0x00000000000000000000000000000000000000Aa';
const TOKEN = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';

const request = (transaction_hash: string) => ({
  amount: '1000',
  blockNumber: '1',
  offerToken: TOKEN,
  timestamp: '1',
  transaction_hash,
  user: USER,
  wantToken: TOKEN,
  wantTokenDecimals: '18',
  wantTokenSymbol: 'wstETH',
  metadata: {
    amountOfAssets: '1',
    amountOfShares: '1',
    assetOut: TOKEN,
    creationTime: '1',
    nonce: '1',
    secondsToDeadline: '1',
    secondsToMaturity: '1',
    user: USER,
  },
});

const event = (transaction_hash: string) => ({
  block_number: '1',
  timestamp: '1',
  transaction_hash,
});

const response = (hash: string) => ({
  Response: {
    open_requests: [request(hash)],
    expired_requests: [request(hash)],
    fulfilled_requests: [{ Fulfillment: event(hash), Request: request(hash) }],
    cancelled_requests: [{ Cancellation: event(hash), Request: request(hash) }],
  },
});

const hashesOf = (parsed: ReturnType<typeof WQ_API_RESPONSE_SCHEMA.parse>) => {
  const { Response } = parsed;
  return [
    Response.open_requests[0]?.transaction_hash,
    Response.expired_requests[0]?.transaction_hash,
    Response.fulfilled_requests[0]?.Fulfillment.transaction_hash,
    Response.fulfilled_requests[0]?.Request.transaction_hash,
    Response.cancelled_requests[0]?.Cancellation.transaction_hash,
    Response.cancelled_requests[0]?.Request.transaction_hash,
  ];
};

describe('WQ_API_RESPONSE_SCHEMA', () => {
  it('accepts hashes without 0x and adds the prefix', () => {
    const parsed = WQ_API_RESPONSE_SCHEMA.parse(response(API_HASH));

    expect(hashesOf(parsed)).toEqual(Array.from({ length: 6 }, () => HASH));
  });

  it('keeps hashes that already have 0x', () => {
    const parsed = WQ_API_RESPONSE_SCHEMA.parse(response(HASH));

    expect(hashesOf(parsed)).toEqual(Array.from({ length: 6 }, () => HASH));
  });

  it('still rejects a value that is not a hash', () => {
    expect(WQ_API_RESPONSE_SCHEMA.safeParse(response('abc')).success).toBe(
      false,
    );
  });
});
