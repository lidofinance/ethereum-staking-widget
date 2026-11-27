// D6 precision: 1e6 == 100%, so percent = feeD6 / 10_000.
// toFixed(4) is lossless for any uint24 (D6 granularity is 0.0001%);
// Number() then drops trailing zeros: 2000 -> '0.2', 150000 -> '15', 0 -> '0'.
export const formatFeeD6 = (feeD6: number): string =>
  String(Number((feeD6 / 10_000).toFixed(4)));

export type ActiveFeesD6 = {
  protocolFeeD6: number;
  performanceFeeD6: number;
};

export type ActiveFees = {
  performanceFee: string;
  // the protocol (AUM) fee; the vault page calls it the platform fee
  platformFee: string;
};

export const formatActiveFees = ({
  protocolFeeD6,
  performanceFeeD6,
}: ActiveFeesD6): ActiveFees => ({
  performanceFee: `${formatFeeD6(performanceFeeD6)}%`,
  platformFee: `${formatFeeD6(protocolFeeD6)}%`,
});
