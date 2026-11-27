import { parseEther } from 'viem';
import type { z } from 'zod';

import { LIMIT_LEVEL } from 'types';

import { errorTexts } from '../error-texts';

import {
  amountSchema,
  atMost,
  ethWithGas,
  requiredAmount,
  tokenWithEthGas,
  validAmount,
  withinStakeLimit,
} from './amount';
import { parseOrThrow } from './parse';

// asserts which check fires, through errorTexts: the wording can change
const { general, stake } = errorTexts.forms;

const firstMessage = (
  schema: {
    safeParse: (value: unknown) => {
      success: boolean;
      error?: { issues: { message: string }[] };
    };
  },
  value: unknown,
) => {
  const result = schema.safeParse(value);
  return result.success ? null : result.error?.issues[0]?.message;
};

const ONE = parseEther('1');
const GAS = parseEther('0.1');

// what a resolver reports: parseOrThrow's ValidationError message
const reportedMessage = (schema: z.ZodType, value: unknown) => {
  try {
    parseOrThrow(schema, value);
    return null;
  } catch (error) {
    return (error as Error).message;
  }
};

describe('requiredAmount', () => {
  it('no amount (empty or 0) is required, with no text', () => {
    // zod would report its default "Invalid input" for an empty message
    expect(reportedMessage(requiredAmount(), null)).toBe(
      general.amountRequired(),
    );
    expect(reportedMessage(requiredAmount(), 0n)).toBe(
      general.amountRequired(),
    );
  });

  it('passes an amount through as a bigint', () => {
    expect(requiredAmount().parse(ONE)).toBe(ONE);
  });
});

describe('amount checks', () => {
  it('validAmount: a non-positive amount is invalid', () => {
    expect(firstMessage(amountSchema(validAmount('ETH')), -1n)).toBe(
      general.amountInvalid('ETH'),
    );
    expect(firstMessage(amountSchema(validAmount('ETH')), ONE)).toBeNull();
  });

  it('withinStakeLimit: reached first, then the limit', () => {
    expect(
      firstMessage(
        amountSchema(
          withinStakeLimit(
            { level: LIMIT_LEVEL.REACHED, currentStakeLimit: 0n },
            'ETH',
          ),
        ),
        ONE,
      ),
    ).toBe(stake.stakeLimitReached());
    expect(
      firstMessage(
        amountSchema(
          withinStakeLimit(
            { level: LIMIT_LEVEL.SAFE, currentStakeLimit: ONE },
            'WETH',
          ),
        ),
        2n * ONE,
      ),
    ).toBe(stake.stakeLimitExceeded(ONE, 'WETH'));
  });

  it('atMost: the given message', () => {
    expect(firstMessage(amountSchema(atMost(ONE, 'too much')), 2n * ONE)).toBe(
      'too much',
    );
  });

  describe('ethWithGas', () => {
    const gas = { etherBalance: ONE, gasCost: GAS };

    it('balance first', () => {
      expect(
        firstMessage(
          amountSchema(ethWithGas({ ...gas, isSmartAccount: false })),
          2n * ONE,
        ),
      ).toBe(general.insufficientBalance(ONE, 'ETH'));
    });

    it('leaves the gas cost', () => {
      expect(
        firstMessage(
          amountSchema(ethWithGas({ ...gas, isSmartAccount: false })),
          ONE,
        ),
      ).toBe(general.gasReserve(ONE - GAS));
    });

    it('cannot cover gas at all', () => {
      expect(
        firstMessage(
          amountSchema(
            ethWithGas({
              etherBalance: parseEther('0.05'),
              gasCost: GAS,
              isSmartAccount: false,
            }),
          ),
          1n,
        ),
      ).toBe(general.insufficientGas(GAS));
    });

    it('a smart account keeps no gas reserve', () => {
      expect(
        firstMessage(
          amountSchema(ethWithGas({ ...gas, isSmartAccount: true })),
          ONE,
        ),
      ).toBeNull();
    });
  });

  describe('tokenWithEthGas', () => {
    const args = {
      symbol: 'WETH',
      balance: ONE,
      etherBalance: parseEther('0.01'),
      gasCost: GAS,
      isSmartAccount: false,
    };

    it('token balance first', () => {
      expect(firstMessage(amountSchema(tokenWithEthGas(args)), 2n * ONE)).toBe(
        general.insufficientBalance(ONE, 'WETH'),
      );
    });

    it('ETH must cover the gas', () => {
      expect(firstMessage(amountSchema(tokenWithEthGas(args)), ONE)).toBe(
        general.insufficientGas(GAS),
      );
    });
  });
});
