import { z } from 'zod';
import {
  getAddress,
  isAddress,
  isHash,
  isHex,
  type Address,
  type Hash,
  type Hex,
} from 'viem';

/**
 * The public CCIP API, the off-chain view of a message: whether it was
 * transported and executed on the destination. It answers by message id
 * only, needs no key, and is open to browsers. What it does not know is
 * whether the stake inside the execution worked: that is the receiver's
 * state on L1
 */

export const CCIP_API_DEFAULT_BASE_URL = 'https://api.ccip.chain.link';
export const CCIP_EXPLORER_DEFAULT_BASE_URL = 'https://ccip.chain.link';

// The two terminal values are stable; the rest are Chainlink-side steps and
// are not an ordered enum, so anything else reads as "still in transport"
export const CCIP_MESSAGE_STATUS = {
  success: 'SUCCESS',
  failed: 'FAILED',
} as const;

const hex = z.custom<Hex>((value) => isHex(value), 'expected a hex string');
const hash = z.custom<Hash>(
  (value) => typeof value === 'string' && isHash(value),
  'expected a 32-byte hash',
);
// accepted in any casing, handed on checksummed
const address = z
  .custom<string>(
    (value) => typeof value === 'string' && isAddress(value, { strict: false }),
    'expected an address',
  )
  .transform((value): Address => getAddress(value));
// the API serialises uint values as decimal strings
const bigintString = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => BigInt(value));

const networkInfoSchema = z.object({
  chainSelector: bigintString,
  chainId: z.string().regex(/^\d+$/).transform(Number),
});

// Only what the status pipeline reads; the API carries more
export const ccipMessageSchema = z.object({
  messageId: hash,
  status: z.string(),
  sender: address,
  receiver: address,
  data: hex,
  sourceNetworkInfo: networkInfoSchema,
  destNetworkInfo: networkInfoSchema,
  sendTransactionHash: hash,
  sendBlockNumber: z.number().int(),
  // present once executed on the destination
  receiptTransactionHash: hash.nullish(),
  receiptBlockNumber: z.number().int().nullish(),
  readyForManualExecution: z.boolean().default(false),
  tokenAmounts: z
    .array(z.object({ destTokenAddress: address, amount: bigintString }))
    .default([]),
});

export type CcipMessage = z.infer<typeof ccipMessageSchema>;

// A list entry: the message without its payload. `origin` is the account
// that signed the send transaction: the user behind an EOA stake, the
// bundler or relayer behind a smart account's
export const ccipMessageSummarySchema = z.object({
  messageId: hash,
  sender: address,
  receiver: address,
  origin: address,
  status: z.string(),
  sourceNetworkInfo: networkInfoSchema,
  destNetworkInfo: networkInfoSchema,
  sendTransactionHash: hash,
  sendTimestamp: z.string(),
  receiptTransactionHash: hash.nullish(),
});

export type CcipMessageSummary = z.infer<typeof ccipMessageSummarySchema>;

export const ccipMessageListSchema = z.object({
  data: z.array(ccipMessageSummarySchema),
  pagination: z.object({
    limit: z.number().int(),
    hasNextPage: z.boolean(),
    cursor: z.string().nullable(),
    totalCount: z.number().int().optional(),
  }),
});

export type CcipMessageList = z.infer<typeof ccipMessageListSchema>;

// The filters the list endpoint takes; it rejects any other parameter
export type CcipMessageListQuery = {
  sender?: Address;
  receiver?: Address;
  sourceChainSelector?: bigint;
  destChainSelector?: bigint;
  limit?: number;
  cursor?: string;
};

export class CcipApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CcipApiError';
    this.status = status;
  }
}

// Paths as segment lists: each segment is encoded, none is concatenated
const CCIP_API_ROUTES = {
  message: (messageId: Hash) => ['v2', 'messages', messageId] as const,
  messages: () => ['v2', 'messages'] as const,
};

// Query values as the API spells them: selectors as decimal strings, only
// the filters that are set
const toSearchParams = (query: CcipMessageListQuery): URLSearchParams => {
  const params = new URLSearchParams();
  const entries: [string, string | undefined][] = [
    ['sender', query.sender],
    ['receiver', query.receiver],
    ['sourceChainSelector', query.sourceChainSelector?.toString()],
    ['destChainSelector', query.destChainSelector?.toString()],
    ['limit', query.limit?.toString()],
    ['cursor', query.cursor],
  ];
  for (const [key, value] of entries) {
    if (value !== undefined) params.set(key, value);
  }
  return params;
};

const CCIP_EXPLORER_ROUTES = {
  message: (messageId: Hash) => ['msg', messageId] as const,
};

const buildUrl = (
  baseUrl: string,
  segments: readonly string[],
  search?: URLSearchParams,
): URL => {
  const url = new URL(baseUrl);
  const base = url.pathname.replace(/\/+$/, '');
  url.pathname = [base, ...segments.map(encodeURIComponent)].join('/');
  if (search) url.search = search.toString();
  return url;
};

export const getCcipExplorerMessageUrl = (
  messageId: Hash,
  baseUrl = CCIP_EXPLORER_DEFAULT_BASE_URL,
): string => buildUrl(baseUrl, CCIP_EXPLORER_ROUTES.message(messageId)).href;

export type CcipApiClientOptions = {
  baseUrl?: string;
  // the global fetch unless a test hands one in
  fetcher?: typeof fetch;
};

export class CcipApiClient {
  readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor({
    baseUrl = CCIP_API_DEFAULT_BASE_URL,
    fetcher,
  }: CcipApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.fetcher = fetcher ?? ((...args) => fetch(...args));
  }

  public getMessageUrl(messageId: Hash): string {
    return buildUrl(this.baseUrl, CCIP_API_ROUTES.message(messageId)).href;
  }

  public getMessagesUrl(query: CcipMessageListQuery): string {
    return buildUrl(
      this.baseUrl,
      CCIP_API_ROUTES.messages(),
      toSearchParams(query),
    ).href;
  }

  // One page of messages, newest first; `pagination.cursor` fetches the next
  public async listMessages(
    query: CcipMessageListQuery,
  ): Promise<CcipMessageList> {
    const response = await this.request(this.getMessagesUrl(query));
    if (!response.ok) {
      throw new CcipApiError(
        `CCIP API responded with ${response.status}`,
        response.status,
      );
    }
    return this.parse(ccipMessageListSchema, await response.json());
  }

  // null when the API does not know the message yet: a message is listed a
  // little after its send transaction is mined
  public async getMessage(messageId: Hash): Promise<CcipMessage | null> {
    const response = await this.request(this.getMessageUrl(messageId));
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new CcipApiError(
        `CCIP API responded with ${response.status}`,
        response.status,
      );
    }
    return this.parse(ccipMessageSchema, await response.json());
  }

  private async request(url: string): Promise<Response> {
    try {
      return await this.fetcher(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
    } catch (error) {
      throw new CcipApiError('CCIP API is unreachable', undefined, {
        cause: error,
      });
    }
  }

  private parse<T>(schema: z.ZodType<T>, body: unknown): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new CcipApiError('CCIP API response has an unexpected shape', 200, {
        cause: parsed.error,
      });
    }
    return parsed.data;
  }
}
