import { TOKENS, type Token } from 'consts/tokens';
import { ONE_wstETH } from 'modules/web3/consts/units';
import { bnAmountToNumber } from 'utils/bn';
import { getTokenDecimals } from 'utils/token-decimals';

import {
  SMART_SUGGEST_ETH_VAULT_TOKENS,
  SMART_SUGGEST_MIN_USD,
  SMART_SUGGEST_USD_VAULT_TOKENS,
  type SmartSuggestToken,
  type SmartSuggestVault,
} from '../consts';

const ETH_DECIMALS = 18;

// APY is a percent value. Keep 4 decimal digits for bigint math.
const APY_SCALE = 10_000;
const APY_DIVISOR = BigInt(100 * APY_SCALE);

export type SmartSuggestEthUsdPrice = {
  latestAnswer: bigint;
  decimals: bigint;
};

export type SmartSuggestVaultData = {
  // Percent value, e.g. 7.1 means 7.1%
  apy?: number;
  isDepositEnabled: boolean;
};

export type CalculateSuggestionsArgs = {
  balances: Partial<Record<SmartSuggestToken, bigint>>;
  ethUsdPrice?: SmartSuggestEthUsdPrice;
  // stETH amount for ONE_wstETH
  stethPerWsteth?: bigint;
  vaults: Record<SmartSuggestVault, SmartSuggestVaultData>;
  minUsd?: number;
};

export type SmartSuggestRow = {
  token: SmartSuggestToken;
  vault: SmartSuggestVault;
  balance: bigint;
  decimals: number;
  apy: number;
  yearlyYield: bigint;
  yieldToken: Token;
  yieldDecimals: number;
  yearlyYieldUsd: number;
};

export type SmartSuggestResult = {
  rows: SmartSuggestRow[];
  totalUsd: number;
};

const applyApy = (amount: bigint, apy: number): bigint =>
  (amount * BigInt(Math.round(apy * APY_SCALE))) / APY_DIVISOR;

const isApyValid = (apy?: number): apy is number =>
  apy != null && Number.isFinite(apy) && apy > 0;

const getEthVaultRows = (
  args: CalculateSuggestionsArgs,
  apy: number,
  minUsd: number,
): SmartSuggestRow[] => {
  const { balances, ethUsdPrice, stethPerWsteth } = args;
  if (!ethUsdPrice) return [];

  return SMART_SUGGEST_ETH_VAULT_TOKENS.flatMap<SmartSuggestRow>((token) => {
    const balance = balances[token];
    if (balance == null || balance <= 0n) return [];

    // stETH is 1:1 to ETH. wstETH needs the wrap rate.
    let ethAmount = balance;
    if (token === TOKENS.wsteth) {
      if (stethPerWsteth == null) return [];
      ethAmount = (balance * stethPerWsteth) / ONE_wstETH;
    }

    const balanceUsd = bnAmountToNumber(
      ethAmount * ethUsdPrice.latestAnswer,
      ETH_DECIMALS + Number(ethUsdPrice.decimals),
    );
    if (balanceUsd < minUsd) return [];

    return {
      token,
      vault: 'eth',
      balance,
      decimals: ETH_DECIMALS,
      apy,
      yearlyYield: applyApy(ethAmount, apy),
      yieldToken: TOKENS.eth,
      yieldDecimals: ETH_DECIMALS,
      yearlyYieldUsd: (balanceUsd * apy) / 100,
    };
  });
};

const getUsdVaultRows = (
  args: CalculateSuggestionsArgs,
  apy: number,
  minUsd: number,
): SmartSuggestRow[] =>
  SMART_SUGGEST_USD_VAULT_TOKENS.flatMap<SmartSuggestRow>((token) => {
    const balance = args.balances[token];
    if (balance == null || balance <= 0n) return [];

    const decimals = getTokenDecimals(token);
    const balanceUsd = bnAmountToNumber(balance, decimals);
    if (balanceUsd < minUsd) return [];

    return {
      token,
      vault: 'usd',
      balance,
      decimals,
      apy,
      yearlyYield: applyApy(balance, apy),
      yieldToken: token,
      yieldDecimals: decimals,
      yearlyYieldUsd: (balanceUsd * apy) / 100,
    };
  });

export const calculateSuggestions = (
  args: CalculateSuggestionsArgs,
): SmartSuggestResult => {
  const { vaults, minUsd = SMART_SUGGEST_MIN_USD } = args;
  const ethApy = vaults.eth.apy;
  const usdApy = vaults.usd.apy;

  const rows = [
    ...(vaults.eth.isDepositEnabled && isApyValid(ethApy)
      ? getEthVaultRows(args, ethApy, minUsd)
      : []),
    ...(vaults.usd.isDepositEnabled && isApyValid(usdApy)
      ? getUsdVaultRows(args, usdApy, minUsd)
      : []),
  ];

  const totalUsd = rows.reduce((sum, row) => sum + row.yearlyYieldUsd, 0);

  return { rows, totalUsd };
};
