import type {
  PortfolioActivityType,
  PortfolioTransaction,
} from 'utilsApi/portfolio/types';

import { config } from 'config';
import { LOCALE } from 'config/groups/locale';
import { TOKENS, type Token } from 'consts/tokens';

import type { PortfolioRow } from '../types';

export const ACTIVITY_LABELS: Record<PortfolioActivityType, string> = {
  stake: 'Stake',
  wrap: 'Wrap',
  unwrap: 'Unwrap',
  swap: 'Swap',
  send: 'Send',
  receive: 'Receive',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  withdrawalRequest: 'Withdrawal request',
  withdrawalClaim: 'Withdrawal claim',
  mint: 'Mint',
  burn: 'Burn',
};

// a transfer has no token address for a native coin only
const isRowTransfer = (
  transfer: PortfolioTransaction['transfers'][number],
  chain: PortfolioRow['chains'][number],
) =>
  transfer.tokenAddress === chain.address &&
  (chain.address !== null || chain.isNative);

// transactions of this row: by operation type, or by token contract and chain
export const getTokenTransactions = (
  transactions: PortfolioTransaction[],
  row: PortfolioRow,
): PortfolioTransaction[] =>
  transactions.filter((transaction) =>
    row.chains.some(
      (chain) =>
        chain.slug === transaction.chainSlug &&
        (row.activityTypes
          ? row.activityTypes.includes(transaction.type)
          : transaction.transfers.some((transfer) =>
              isRowTransfer(transfer, chain),
            )),
    ),
  );

// the transfer of a transaction the row shows the amount of
export const getRowTransfer = (
  transaction: PortfolioTransaction,
  row: PortfolioRow,
): PortfolioTransaction['transfers'][number] | undefined =>
  transaction.transfers.find((transfer) =>
    row.chains.some((chain) => isRowTransfer(transfer, chain)),
  ) ?? (row.activityTypes ? transaction.transfers[0] : undefined);

const DAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
};
const DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };
// the same date and time format as the Earn pages
const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
  hour12: false,
};

// Jul 9
export const formatActivityDay = (timestamp: number | null): string =>
  timestamp == null
    ? '—'
    : new Date(timestamp).toLocaleDateString(LOCALE, DAY_FORMAT);

// Jul 9, 2025
export const formatActivityDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString(LOCALE, DATE_FORMAT);

// the earliest moment the loaded transactions reach back to
export const getOldestTimestamp = (
  transactions: PortfolioTransaction[],
): number | null =>
  transactions.reduce<number | null>((oldestTimestamp, { timestamp }) => {
    if (timestamp == null) return oldestTimestamp;
    return oldestTimestamp == null
      ? timestamp
      : Math.min(oldestTimestamp, timestamp);
  }, null);

// Jul 9, 2025, 16:30
export const formatActivityTime = (timestamp: number | null): string =>
  timestamp == null
    ? '—'
    : new Date(timestamp).toLocaleString(LOCALE, DATE_TIME_FORMAT);

// amounts as Lambda gives them, as floats, up to 8 decimals
export const formatTransferAmount = (amount: number): string =>
  amount.toLocaleString(config.LOCALE, { maximumFractionDigits: 8 });

export const shortenHex = (hexString: string): string =>
  `${hexString.slice(0, 6)}...${hexString.slice(-4)}`;

const PRODUCT_ICONS: Record<string, Token> = {
  Staking: TOKENS.steth,
  EarnETH: TOKENS.earneth,
  EarnUSD: TOKENS.earnusd,
};

export type PartyLabel = 'From' | 'To' | 'Transaction';

// the other side as the design shows it: a Lido product, an address or the tx
export const getParty = (
  transaction: PortfolioTransaction,
): { label: PartyLabel; value: string; product?: Token } => {
  const label: PartyLabel =
    transaction.transfers[0]?.direction === 'in' ? 'From' : 'To';
  if (transaction.product && PRODUCT_ICONS[transaction.product]) {
    return {
      label,
      value: transaction.product,
      product: PRODUCT_ICONS[transaction.product],
    };
  }
  if (
    transaction.counterparty &&
    (transaction.type === 'send' || transaction.type === 'receive')
  ) {
    return { label, value: transaction.counterparty };
  }
  return { label: 'Transaction', value: transaction.hash };
};
