import { z } from 'zod';
import { ethAddress } from 'viem';

import { CHAINS } from 'consts/chains';
import { TOKENS, type Token } from 'consts/tokens';
import { getTokenAddress } from 'config/networks/token-address';

import type { LambdaClient } from './lambda-client';
import type {
  PortfolioActivityType,
  PortfolioTransaction,
  PortfolioTransactionsResponse,
  PortfolioTransfer,
} from './types';

// a busy wallet's history takes tens of seconds upstream
const TRANSACTIONS_TIMEOUT_MS = 45_000;
// the most P2P serves at once; one call whatever the size
export const TRANSACTIONS_PAGE_SIZE = 200;

const MAX_SYMBOL_LENGTH = 16;
const MAX_NAME_LENGTH = 48;
// links in a name, domains in a symbol: the same rule as for positions
const LINK_LIKE = /https?:|www\./i;
const DOMAIN_LIKE = /\.(com|io|org|net|xyz|app|site|top|cfd|claim)\b/i;
const MAX_TRANSFERS = 20;
const HEX = /^0x[\da-f]+$/i;
const EVM_ADDRESS = /^0x[\da-f]{40}$/;
// bounds keep a broken upstream row from reaching the page in full
const ADDRESS = z.string().max(64);
const LABEL = z.string().max(256);

// cursors are opaque, but short and printable
const CURSOR_PATTERN = /^[\w+/=.:-]{1,512}$/;

export const isValidCursor = (cursor: string): boolean =>
  CURSOR_PATTERN.test(cursor);

const ACTIVITY_TYPES: Record<string, PortfolioActivityType> = {
  trade: 'swap',
  send: 'send',
  receive: 'receive',
  deposit: 'deposit',
  withdraw: 'withdraw',
  mint: 'mint',
  burn: 'burn',
};

const TransferSchema = z.object({
  direction: z.string().max(16),
  sender_address: ADDRESS.nullish(),
  recipient_address: ADDRESS.nullish(),
  token: z
    .object({
      name: LABEL.nullish(),
      symbol: LABEL.nullish(),
      address: ADDRESS.nullish(),
    })
    .nullish(),
  decimals: z.number().int().nullish(),
  amount_string: z.string().max(80).nullish(),
  amount: z.number().nullish(),
  value_usd: z.number().nullish(),
});

const TransactionSchema = z.object({
  type: z.string(),
  hash: z.string().max(80).regex(HEX),
  timestamp: z.number().nullish(),
  status: z.string(),
  chain_id: z.string().max(40),
  chain_name: z.string().max(40),
  chain_id_numeric: z.number().int().nullish(),
  sender_address: z.string().max(64).nullish(),
  recipient_address: z.string().max(64).nullish(),
  defi: z.object({ name: z.string().nullish() }).nullish(),
  transfers: z.array(TransferSchema).max(MAX_TRANSFERS),
  attributes: z.object({ is_trash: z.boolean().nullish() }).nullish(),
});

const ResponseSchema = z.object({
  data: z.array(z.unknown()),
  next_page_token: z.string().nullish(),
});

type Transfer = z.infer<typeof TransferSchema>;
type Transaction = z.infer<typeof TransactionSchema>;

const toLowerCaseOrNull = (value: string | null | undefined) =>
  value ? value.toLowerCase() : null;

const toTokenAddress = (value: string | null | undefined) => {
  const address = toLowerCaseOrNull(value);
  return address === ethAddress.toLowerCase() ? null : address;
};

const toTransfer = (upstreamTransfer: Transfer): PortfolioTransfer | null => {
  const symbol = (upstreamTransfer.token?.symbol ?? '').trim();
  const name = (upstreamTransfer.token?.name ?? '').trim() || symbol;
  if (
    !symbol ||
    LINK_LIKE.test(symbol) ||
    DOMAIN_LIKE.test(symbol) ||
    LINK_LIKE.test(name)
  )
    return null;
  if (!(upstreamTransfer.amount && upstreamTransfer.amount > 0)) return null;
  return {
    direction: upstreamTransfer.direction === 'in' ? 'in' : 'out',
    symbol: symbol.slice(0, MAX_SYMBOL_LENGTH),
    name: name.slice(0, MAX_NAME_LENGTH),
    tokenAddress: toTokenAddress(upstreamTransfer.token?.address),
    amount: upstreamTransfer.amount,
    valueUsd: upstreamTransfer.value_usd ?? null,
  };
};

// receives below this value are dust: airdrop spam or address poisoning
const MIN_RECEIVE_USD = 1;

// Lido tokens cannot be faked, so their small receives are real activity
const isLidoReceive = (
  transaction: Transaction,
  transfers: PortfolioTransfer[],
) =>
  transaction.chain_id_numeric === CHAINS.Mainnet &&
  transfers.every(
    (transfer) =>
      !!transfer.tokenAddress && LIDO_ADDRESSES.has(transfer.tokenAddress),
  );

const isSpam = (transaction: Transaction, transfers: PortfolioTransfer[]) =>
  transaction.attributes?.is_trash === true ||
  (transaction.type === 'receive' &&
    !isLidoReceive(transaction, transfers) &&
    transfers.reduce((sum, transfer) => sum + (transfer.valueUsd ?? 0), 0) <
      MIN_RECEIVE_USD);

const NON_ASCII = /[^\u0020-\u007E]/;

// a token with no price that imitates a real one, or moves "from" the wallet
// in a transaction the wallet did not send: address poisoning
const isImitation = (
  transaction: Transaction,
  transfer: PortfolioTransfer,
  wallet: string,
) => {
  if (transfer.valueUsd != null) return false;
  if (NON_ASCII.test(transfer.symbol) || NON_ASCII.test(transfer.name)) {
    return true;
  }
  return (
    transfer.direction === 'out' &&
    toLowerCaseOrNull(transaction.sender_address) !== wallet
  );
};

const getMainnetTokenAddress = (token: Token) =>
  getTokenAddress(CHAINS.Mainnet, token)?.toLowerCase() ?? null;

const LIDO_ADDRESSES = new Set(
  [TOKENS.steth, TOKENS.wsteth, TOKENS.earneth, TOKENS.earnusd]
    .map(getMainnetTokenAddress)
    .filter((address): address is string => !!address),
);

// Earn products by the share token a transaction moves, on Ethereum
const EARN_PRODUCTS: { token: Token; product: string }[] = [
  { token: TOKENS.earneth, product: 'EarnETH' },
  { token: TOKENS.earnusd, product: 'EarnUSD' },
];

const findTransfer = (
  transfers: PortfolioTransfer[],
  direction: 'in' | 'out',
  token: Token,
) =>
  transfers.find(
    (transfer) =>
      transfer.direction === direction &&
      transfer.tokenAddress === getMainnetTokenAddress(token),
  );

type Relabel = { type: PortfolioActivityType; product: string };

const relabelStaking = (
  transactionRecipient: string | null,
  transfers: PortfolioTransfer[],
): Relabel | null => {
  // the queue mints an unstETH NFT the API does not list, so one side shows
  if (transactionRecipient === getMainnetTokenAddress(TOKENS.unsteth)) {
    if (
      findTransfer(transfers, 'out', TOKENS.steth) ||
      findTransfer(transfers, 'out', TOKENS.wsteth)
    )
      return { type: 'withdrawalRequest', product: 'Staking' };
    if (
      transfers.some(
        (transfer) =>
          transfer.direction === 'in' && transfer.tokenAddress === null,
      )
    )
      return { type: 'withdrawalClaim', product: 'Staking' };
  }
  const hasOutgoingEth = transfers.some(
    (transfer) =>
      transfer.direction === 'out' && transfer.tokenAddress === null,
  );
  if (
    transactionRecipient === getMainnetTokenAddress(TOKENS.steth) &&
    hasOutgoingEth &&
    findTransfer(transfers, 'in', TOKENS.steth)
  )
    return { type: 'stake', product: 'Staking' };
  if (transactionRecipient !== getMainnetTokenAddress(TOKENS.wsteth))
    return null;
  if (
    findTransfer(transfers, 'out', TOKENS.steth) &&
    findTransfer(transfers, 'in', TOKENS.wsteth)
  )
    return { type: 'wrap', product: 'Staking' };
  if (
    findTransfer(transfers, 'in', TOKENS.steth) &&
    findTransfer(transfers, 'out', TOKENS.wsteth)
  )
    return { type: 'unwrap', product: 'Staking' };
  return null;
};

// names Lido flows as the design does: Stake, Wrap, Deposit to EarnETH;
// staking only for calls to the Lido contracts, so a DEX swap stays a swap
const relabel = (
  transaction: Transaction,
  transfers: PortfolioTransfer[],
  chainId: number | null,
): Relabel | null => {
  if (chainId !== CHAINS.Mainnet) return null;
  const stakingRelabel = relabelStaking(
    toLowerCaseOrNull(transaction.recipient_address),
    transfers,
  );
  if (stakingRelabel) return stakingRelabel;

  // a plain transfer of vault shares is not a deposit or a withdrawal
  if (transaction.type === 'send' || transaction.type === 'receive')
    return null;
  for (const { token, product } of EARN_PRODUCTS) {
    if (findTransfer(transfers, 'in', token))
      return { type: 'deposit', product };
    if (findTransfer(transfers, 'out', token))
      return { type: 'withdraw', product };
  }
  return null;
};

export const toPortfolioTransaction = (
  transaction: Transaction,
  wallet: string,
): PortfolioTransaction | null => {
  const activityType = ACTIVITY_TYPES[transaction.type];
  if (!activityType || transaction.status !== 'confirmed') return null;

  // what left the wallet first, then what came in: ETH -> stETH for a stake
  const transferPairs = transaction.transfers
    .flatMap((upstreamTransfer) => {
      const transfer = toTransfer(upstreamTransfer);
      return transfer && !isImitation(transaction, transfer, wallet)
        ? [{ upstreamTransfer, transfer }]
        : [];
    })
    .sort(
      (leftPair, rightPair) =>
        Number(leftPair.transfer.direction === 'in') -
        Number(rightPair.transfer.direction === 'in'),
    );
  const transfers = transferPairs.map(({ transfer }) => transfer);
  if (transferPairs.length === 0 || isSpam(transaction, transfers)) return null;

  // the other side of the first shown transfer
  const [{ upstreamTransfer, transfer: firstTransfer }] = transferPairs;
  const counterpartyCandidate =
    firstTransfer.direction === 'in'
      ? toLowerCaseOrNull(
          upstreamTransfer.sender_address ?? transaction.sender_address,
        )
      : toLowerCaseOrNull(
          upstreamTransfer.recipient_address ?? transaction.recipient_address,
        );
  // the page draws it as an address
  const counterparty =
    counterpartyCandidate && EVM_ADDRESS.test(counterpartyCandidate)
      ? counterpartyCandidate
      : null;

  const chainId = transaction.chain_id_numeric ?? null;
  const lidoRelabel = relabel(transaction, transfers, chainId);
  // a "trade" with one side is a plain transfer to or from a contract
  const isOneSided =
    activityType === 'swap' &&
    transfers.every(
      (transfer) => transfer.direction === transfers[0].direction,
    );
  const plainTransferType: PortfolioActivityType =
    transfers[0].direction === 'in' ? 'receive' : 'send';

  return {
    id: `${transaction.chain_id}:${transaction.hash}`,
    hash: transaction.hash,
    type: lidoRelabel?.type ?? (isOneSided ? plainTransferType : activityType),
    timestamp: transaction.timestamp ?? null,
    chainId,
    chainSlug: transaction.chain_id,
    chainName: transaction.chain_name,
    // the API names a DeFi app by a token id, not a product
    product: lidoRelabel?.product ?? null,
    counterparty: counterparty === wallet ? null : counterparty,
    transfers,
  };
};

export const parseTransactionsResponse = (
  responseBody: unknown,
  wallet: string,
): PortfolioTransactionsResponse => {
  const response = ResponseSchema.parse(responseBody);
  const parseResults = response.data.map((upstreamTransaction) =>
    TransactionSchema.safeParse(upstreamTransaction),
  );
  const invalidCount = parseResults.filter(
    (parseResult) => !parseResult.success,
  ).length;
  if (invalidCount > 0) {
    console.warn(`[portfolio] skipped ${invalidCount} unexpected transactions`);
  }
  return {
    transactions: parseResults
      .flatMap((parseResult) => (parseResult.success ? [parseResult.data] : []))
      .map((transaction) => toPortfolioTransaction(transaction, wallet))
      .filter(
        (transaction): transaction is PortfolioTransaction => !!transaction,
      ),
    // a cursor the route would not take back ends the list
    nextCursor:
      response.next_page_token && isValidCursor(response.next_page_token)
        ? response.next_page_token
        : null,
    updatedAt: Date.now(),
  };
};

// one upstream call per request; spam filtering may leave a short page
export const fetchTransactions = async (
  client: LambdaClient,
  address: string,
  cursor: string | null,
): Promise<PortfolioTransactionsResponse> => {
  const queryParams = new URLSearchParams({
    limit: String(TRANSACTIONS_PAGE_SIZE),
  });
  if (cursor) queryParams.set('page_token', cursor);
  const responseBody = await client.get(
    `/api/v2/transactions/${address}/history?${queryParams}`,
    TRANSACTIONS_TIMEOUT_MS,
  );
  return parseTransactionsResponse(responseBody, address);
};
