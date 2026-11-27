type GetMaxAmountArgs = {
  balance: bigint;
  /** upper limit, e.g. stake limit or pool capacity */
  limit?: bigint;
  /** spends the same ETH that pays gas: keeps `gasCost` and `padding` */
  isPadded?: boolean;
  gasCost?: bigint;
  /** untouchable amount left to the user */
  padding?: bigint;
};

/** what the Max button fills in; never below 0 */
export const getMaxAmount = ({
  balance,
  limit,
  isPadded = false,
  gasCost = 0n,
  padding = 0n,
}: GetMaxAmountArgs): bigint => {
  let max = isPadded ? balance - padding - gasCost : balance;
  if (max < 0n) max = 0n;
  if (limit !== undefined && max > limit) max = limit;
  return max;
};
