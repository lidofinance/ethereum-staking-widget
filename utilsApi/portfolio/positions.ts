import { z } from 'zod';
import { ethAddress } from 'viem';

import { CHAINS } from 'consts/chains';
import { TOKENS, type Token } from 'consts/tokens';
import { getTokenAddress } from 'config/networks/token-address';

import type { LambdaClient } from './lambda-client';
import type { PortfolioActivityType, PortfolioToken } from './types';

const POSITIONS_PATH = '/api/v3/portfolio/positions';
const POSITIONS_TIMEOUT_MS = 20_000;

const MAX_SYMBOL_LENGTH = 16;
const MAX_NAME_LENGTH = 48;
// dust and airdrop junk below this value is hidden
const MIN_VALUE_USD = 1;
// spam tokens advertise phishing sites in their name or symbol
// phishing tokens put links into their name; dots alone are legit (ether.fi)
const LINK_LIKE = /https?:|www\./i;
// a domain is not a legit token symbol
const DOMAIN_LIKE = /\.(com|io|org|net|xyz|app|finance|fi|site|claim)\b/i;
// largest wallets return hundreds of rows; the tail is dust
const MAX_OTHER_ROWS = 100;

const LIDO_TOKENS: Token[] = [
  TOKENS.steth,
  TOKENS.wsteth,
  TOKENS.earneth,
  TOKENS.earnusd,
  TOKENS.gg,
  TOKENS.dvsteth,
  TOKENS.streth,
];

// Lido tokens on Ethereum, lowercase
export const LIDO_TOKEN_ADDRESSES: ReadonlySet<string> = new Set(
  LIDO_TOKENS.map((token) =>
    getTokenAddress(CHAINS.Mainnet, token)?.toLowerCase(),
  ).filter((address): address is string => !!address),
);

// bounds keep a broken upstream row from reaching the page in full
const ID = z.string().max(200);
const CHAIN = z.string().max(40);
const RAW_AMOUNT = z.string().max(80);
const BASE_UNITS_PATTERN = /^\d+$/;

// base units only; anything else falls back to the float amount on the page
const toRawAmount = (value: string | null | undefined) =>
  value && BASE_UNITS_PATTERN.test(value) ? value : '';

const TokenRowSchema = z.object({
  type: z.literal('token'),
  id: ID,
  chain_id: CHAIN,
  chain_id_numeric: z.number().int().nullish(),
  chain_name: CHAIN,
  value_usd: z.number().nullish(),
  attributes: z.object({
    category: z.string().nullish(),
    position_id: z.string().nullish(),
    token_symbol: z.string().nullish(),
    token_name: z.string().nullish(),
    contract_address: z.string().nullish(),
    decimals: z.number().int().nullish(),
    amount_string: RAW_AMOUNT,
    amount: z.number(),
    price_usd: z.number(),
    is_spam: z.boolean().nullish(),
    value_incomplete: z.boolean().nullish(),
  }),
});

const DepositLegSchema = z.object({
  token_symbol: z.string().nullish(),
  token_name: z.string().nullish(),
  contract_address: z.string().nullish(),
  decimals: z.number().int().nullish(),
  amount_string: RAW_AMOUNT.nullish(),
  amount: z.number().nullish(),
  price_usd: z.number().nullish(),
  value_usd: z.number().nullish(),
  // the leg's own status inside a withdrawal position
  attributes: z.object({ category: z.string().nullish() }).nullish(),
});

// DeFi position; Lido stETH and wstETH holdings come in this shape
const PositionRowSchema = z.object({
  type: z.literal('position'),
  id: ID,
  chain_id: CHAIN,
  chain_id_numeric: z.number().int().nullish(),
  chain_name: CHAIN,
  value_usd: z.number().nullish(),
  name: z.string(),
  defi_name: z.string().nullish(),
  attributes: z.object({
    category: z.string().nullish(),
    position_id: z.string().nullish(),
    value_incomplete: z.boolean().nullish(),
    deposits: z.array(DepositLegSchema).optional().default([]),
  }),
});

const PositionsResponseSchema = z.object({
  positions: z.array(z.unknown()),
  data_incomplete: z.boolean().optional(),
});

type TokenRow = z.infer<typeof TokenRowSchema>;
type PositionRow = z.infer<typeof PositionRowSchema>;

// position key for the pnl endpoint; never sent to the browser
export type PnlPositionKey = {
  category: string;
  positionId: string;
};

export type PortfolioTokenWithPnl = PortfolioToken & {
  pnl: PnlPositionKey | null;
};

export type PositionsResult = {
  tokens: PortfolioTokenWithPnl[];
  dataIncomplete: boolean;
};

const isLinkLike = (value: string) => LINK_LIKE.test(value);

const normalizeAddress = (address: string | null | undefined) => {
  if (!address) return null;
  const lowerCaseAddress = address.toLowerCase();
  return lowerCaseAddress === ethAddress.toLowerCase()
    ? null
    : lowerCaseAddress;
};

const isLidoAddress = (chainId: number | null, address: string | null) =>
  chainId === CHAINS.Mainnet && !!address && LIDO_TOKEN_ADDRESSES.has(address);

const toPnlKey = (
  category: string | null | undefined,
  positionId: string | null | undefined,
): PnlPositionKey | null =>
  category && positionId ? { category, positionId } : null;

const isSafeText = (symbol: string, name: string, isTokenRow: boolean) =>
  !!symbol &&
  !isLinkLike(symbol) &&
  !isLinkLike(name) &&
  !(isTokenRow && DOMAIN_LIKE.test(symbol));

// Lido rows are kept at any value: they carry the pnl keys for rewards
// debts come as negative values and must stay in the net worth
const isDisplayable = (
  token: PortfolioTokenWithPnl,
  valueIncomplete: boolean,
  isTokenRow: boolean,
) =>
  isSafeText(token.symbol, token.name, isTokenRow) &&
  (token.isLido ||
    (!valueIncomplete && Math.abs(token.valueUsd ?? 0) >= MIN_VALUE_USD));

const toTrimmedText = (value: string | null | undefined, maxLength: number) =>
  (value ?? '').trim().slice(0, maxLength);

// Lambda names may already start with the protocol, e.g. "Aave V3 Lending"
const getPositionName = ({ defi_name, name }: PositionRow) =>
  !defi_name || name.startsWith(defi_name) ? name : `${defi_name} ${name}`;

export const tokenRowToPortfolioToken = (
  tokenRow: TokenRow,
): PortfolioTokenWithPnl | null => {
  const { attributes } = tokenRow;
  if (attributes.is_spam === true || !(attributes.amount > 0)) return null;

  const chainId = tokenRow.chain_id_numeric ?? null;
  const address = normalizeAddress(attributes.contract_address);
  const symbol = toTrimmedText(attributes.token_symbol, MAX_SYMBOL_LENGTH);
  const token: PortfolioTokenWithPnl = {
    id: tokenRow.id,
    chainId,
    chainSlug: tokenRow.chain_id,
    chainName: tokenRow.chain_name,
    address,
    // Lambda marks native coins with the 0xeeee... sentinel
    isNative:
      attributes.contract_address?.toLowerCase() === ethAddress.toLowerCase(),
    symbol,
    name: toTrimmedText(attributes.token_name, MAX_NAME_LENGTH) || symbol,
    decimals: attributes.decimals ?? null,
    amountRaw: toRawAmount(attributes.amount_string),
    amount: attributes.amount,
    priceUsd: attributes.price_usd,
    valueUsd: tokenRow.value_usd ?? null,
    isLido: isLidoAddress(chainId, address),
    pnl: toPnlKey(attributes.category, attributes.position_id),
  };
  return isDisplayable(token, !!attributes.value_incomplete, true)
    ? token
    : null;
};

export const positionRowToPortfolioToken = (
  positionRow: PositionRow,
): PortfolioTokenWithPnl | null => {
  const { attributes } = positionRow;
  const chainId = positionRow.chain_id_numeric ?? null;
  const positionId = normalizeAddress(attributes.position_id);
  const isLido = isLidoAddress(chainId, positionId);
  // amounts add up only for a single-leg position
  const singleDepositLeg =
    attributes.deposits.length === 1 ? attributes.deposits[0] : null;
  const symbol = toTrimmedText(
    attributes.deposits.map((deposit) => deposit.token_symbol).join('+'),
    MAX_SYMBOL_LENGTH,
  );
  const name = isLido
    ? toTrimmedText(singleDepositLeg?.token_name, MAX_NAME_LENGTH) || symbol
    : toTrimmedText(getPositionName(positionRow), MAX_NAME_LENGTH);

  const token: PortfolioTokenWithPnl = {
    id: positionRow.id,
    chainId,
    chainSlug: positionRow.chain_id,
    chainName: positionRow.chain_name,
    address: isLido ? positionId : null,
    isNative: false,
    symbol,
    name,
    decimals: singleDepositLeg?.decimals ?? null,
    amountRaw: toRawAmount(singleDepositLeg?.amount_string),
    amount: singleDepositLeg?.amount ?? 0,
    priceUsd: singleDepositLeg?.price_usd ?? null,
    valueUsd: positionRow.value_usd ?? null,
    isLido,
    pnl: toPnlKey(attributes.category, attributes.position_id),
  };
  return isDisplayable(token, !!attributes.value_incomplete, false)
    ? token
    : null;
};

// withdrawal queues: stETH requests and Earn redeem requests
const WITHDRAWAL_CATEGORY_PREFIXES = ['lido-withdrawal-', 'lido-redeem-queue-'];

const isWithdrawalCategory = (category: string | null | undefined) =>
  !!category &&
  WITHDRAWAL_CATEGORY_PREFIXES.some((prefix) => category.startsWith(prefix));

const STETH_WITHDRAWAL_CATEGORY_PREFIX = 'lido-withdrawal-';
// the operations that create and close a stETH withdrawal request
const STETH_WITHDRAWAL_ACTIVITY_TYPES: PortfolioActivityType[] = [
  'withdrawalRequest',
  'withdrawalClaim',
];

const CLAIMABLE_CATEGORY_SUFFIX = '-claimable';

// short enough to fit the asset column, where the token goes below the name
const getWithdrawalStatusName = (category: string | null | undefined) =>
  category?.endsWith(CLAIMABLE_CATEGORY_SUFFIX)
    ? 'Ready to claim'
    : 'Withdrawal pending';

// one row per status, each with its own amount; null for other positions
export const withdrawalRowToPortfolioTokens = (
  positionRow: PositionRow,
): PortfolioTokenWithPnl[] | null => {
  const { attributes } = positionRow;
  if (!isWithdrawalCategory(attributes.category)) return null;
  if (attributes.value_incomplete) return [];

  return attributes.deposits.flatMap((depositLeg, legIndex) => {
    const legAmount = depositLeg.amount ?? 0;
    if (!(legAmount > 0)) return [];
    const legCategory = depositLeg.attributes?.category ?? attributes.category;
    const symbol = toTrimmedText(depositLeg.token_symbol, MAX_SYMBOL_LENGTH);
    const name = getWithdrawalStatusName(legCategory);
    // a request of any size is shown: it is the user's own funds in a queue
    if (!isSafeText(symbol, name, false)) return [];
    const legPriceUsd = depositLeg.price_usd ?? null;
    return [
      {
        id: `${positionRow.id}:${legCategory ?? ''}:${legIndex}`,
        chainId: positionRow.chain_id_numeric ?? null,
        chainSlug: positionRow.chain_id,
        chainName: positionRow.chain_name,
        address: null,
        isNative: false,
        symbol,
        name,
        decimals: depositLeg.decimals ?? null,
        amountRaw: toRawAmount(depositLeg.amount_string),
        amount: legAmount,
        priceUsd: legPriceUsd,
        valueUsd:
          depositLeg.value_usd ??
          (legPriceUsd == null ? null : legAmount * legPriceUsd),
        // shown with the Lido positions; no pnl key, so no rewards call
        isLido: true,
        pnl: null,
        ...(legCategory?.startsWith(STETH_WITHDRAWAL_CATEGORY_PREFIX)
          ? { activityTypes: STETH_WITHDRAWAL_ACTIVITY_TYPES }
          : {}),
      },
    ];
  });
};

const RowSchema = z.discriminatedUnion('type', [
  TokenRowSchema,
  PositionRowSchema,
]);

export const parsePositionsResponse = (
  responseBody: unknown,
): PositionsResult => {
  const response = PositionsResponseSchema.parse(responseBody);
  const parseResults = response.positions.map((upstreamRow) =>
    RowSchema.safeParse(upstreamRow),
  );
  const invalidCount = parseResults.filter(
    (parseResult) => !parseResult.success,
  ).length;
  if (invalidCount > 0) {
    console.warn(`[portfolio] skipped ${invalidCount} unexpected rows`);
  }

  const tokens = parseResults
    .flatMap((parseResult) => (parseResult.success ? [parseResult.data] : []))
    .flatMap((upstreamRow) => {
      if (upstreamRow.type === 'token') {
        return [tokenRowToPortfolioToken(upstreamRow)];
      }
      return (
        withdrawalRowToPortfolioTokens(upstreamRow) ?? [
          positionRowToPortfolioToken(upstreamRow),
        ]
      );
    })
    .filter((token): token is PortfolioTokenWithPnl => !!token)
    .sort(
      (leftToken, rightToken) =>
        (rightToken.valueUsd ?? 0) - (leftToken.valueUsd ?? 0),
    );

  const lidoTokens = tokens.filter((token) => token.isLido);
  const otherTokens = tokens.filter((token) => !token.isLido);
  const isTruncated = otherTokens.length > MAX_OTHER_ROWS;

  return {
    tokens: [...lidoTokens, ...otherTokens.slice(0, MAX_OTHER_ROWS)],
    dataIncomplete:
      (response.data_incomplete ?? false) || invalidCount > 0 || isTruncated,
  };
};

export const fetchPositions = async (
  client: LambdaClient,
  address: string,
): Promise<PositionsResult> => {
  const responseBody = await client.post(
    POSITIONS_PATH,
    { wallets: [address], asset_type: 'ALL', hide_spam: true },
    POSITIONS_TIMEOUT_MS,
  );
  return parsePositionsResponse(responseBody);
};
