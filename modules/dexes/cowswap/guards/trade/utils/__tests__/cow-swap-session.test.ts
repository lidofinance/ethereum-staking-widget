import { describe, it, expect } from 'vitest';
import { ethAddress, type Address } from 'viem';

import type { OrderData } from '../../../tx';
import { createCowSwapSession } from '../cow-swap-session';
import type { ValidatedTradeSnapshot } from '../verify-order';

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' as Address;
const ETH = ethAddress.toLowerCase() as Address;
const TOKEN_DECIMALS = { [ETH]: 18, [STETH]: 18 };

const ETH_SNAPSHOT: ValidatedTradeSnapshot = {
  sellToken: ETH,
  buyToken: STETH,
  sellAmountUnits: '0.1',
  buyAmountMinUnits: '0.1',
};

const ETH_ORDER = {
  sellToken: ethAddress,
  buyToken: STETH,
  sellAmount: 100000000000000000n,
  buyAmount: 100000000000000000n,
} as unknown as OrderData;

describe('createCowSwapSession', () => {
  it('a stored trade matches its order', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.storeTrade(ETH_SNAPSHOT);

    expect(session.consumeSignedOrder(ETH_ORDER)).toBeNull();
  });

  it('an ETH order consumes the trade: a second one is rejected', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.storeTrade(ETH_SNAPSHOT);

    expect(session.consumeSignedOrder(ETH_ORDER)).toBeNull();
    expect(session.consumeSignedOrder(ETH_ORDER)).not.toBeNull();
  });

  it('revoking drops the stored trade', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.storeTrade(ETH_SNAPSHOT);
    session.revoke();

    expect(session.isActive()).toBe(false);
    expect(session.consumeSignedOrder(ETH_ORDER)).not.toBeNull();
  });

  it('a trade stored after revoking is ignored', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.revoke();
    session.storeTrade(ETH_SNAPSHOT);

    expect(session.consumeSignedOrder(ETH_ORDER)).not.toBeNull();
  });
});

describe('createCowSwapSession: approvals', () => {
  const STETH_APPROVAL = { token: STETH, maxRaw: 100000000000000000n };
  const STETH_TRADE: ValidatedTradeSnapshot = {
    ...ETH_SNAPSHOT,
    sellToken: STETH,
    buyToken: ETH,
  };

  it('rejects an approve when nothing was validated', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);

    expect(session.verifyApproval({ token: STETH, amount: 1n })).not.toBeNull();
  });

  it('allows an approve up to the validated approval and rejects above it', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.storeApproval(STETH_APPROVAL);

    expect(
      session.verifyApproval({ token: STETH, amount: STETH_APPROVAL.maxRaw }),
    ).toBeNull();
    expect(
      session.verifyApproval({
        token: STETH,
        amount: STETH_APPROVAL.maxRaw + 1n,
      }),
    ).not.toBeNull();
  });

  it('bounds an approve by the validated trade when no approval was validated', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.storeTrade(STETH_TRADE);

    expect(
      session.verifyApproval({ token: STETH, amount: 100000000000000000n }),
    ).toBeNull();
    expect(
      session.verifyApproval({ token: STETH, amount: 100000000000000001n }),
    ).not.toBeNull();
  });

  it('a revoked session rejects the approve it had validated', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.storeApproval(STETH_APPROVAL);
    session.revoke();

    expect(session.verifyApproval({ token: STETH, amount: 1n })).not.toBeNull();
  });

  it('an approval stored after revoking is ignored', () => {
    const session = createCowSwapSession(TOKEN_DECIMALS);
    session.revoke();
    session.storeApproval(STETH_APPROVAL);

    expect(session.verifyApproval({ token: STETH, amount: 1n })).not.toBeNull();
  });
});
