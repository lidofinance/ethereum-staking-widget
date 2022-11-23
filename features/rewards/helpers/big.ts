import { BigNumber } from 'bignumber.js';
import { PRECISE_DECIMALS } from 'features/rewards/constants';

// TODO: change to general solution

// Default WEI Solidity-like instance
class Big extends BigNumber.clone() {}

// Special non-int mode for ETH amounts, APR and other final calculations
class BigDecimal extends BigNumber.clone() {}

// Behave as ints-only until we are in BigDecimal mode
Big.set({ DECIMAL_PLACES: 0 });
BigDecimal.set({ DECIMAL_PLACES: PRECISE_DECIMALS });

// Match solidity calculations by default
Big.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
BigDecimal.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP });

// Never output scientific notations, we don't want our users to see them
Big.set({ EXPONENTIAL_AT: [-70000000, 210000000] });
BigDecimal.set({ EXPONENTIAL_AT: [-70000000, 210000000] });

// Formatting for human readability
BigDecimal.set({
  FORMAT: {
    // string to prepend
    prefix: '',
    // decimal separator
    decimalSeparator: '.',
    // grouping separator of the integer part
    groupSeparator: ',',
    // primary grouping size of the integer part
    groupSize: 3,
    // secondary grouping size of the integer part
    secondaryGroupSize: 0,
    // grouping separator of the fraction part
    fractionGroupSeparator: ' ',
    // grouping size of the fraction part
    fractionGroupSize: 0,
    // string to append
    suffix: '',
  },
});

// BigNumber is here to highlight a universal type between the two instances
export { Big, BigDecimal, type BigNumber };
