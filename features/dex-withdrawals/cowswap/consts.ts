import { GITHUB_RAW_MAIN_PATH } from 'consts/external-links';
import { mainnet, sepolia } from 'viem/chains';

export const COWSWAP_WIDGET_ALLOWED_RPC_METHODS = new Set([
  // read-only
  'eth_accounts',
  'eth_requestAccounts',
  'eth_chainId',
  'eth_call',
  'eth_estimateGas',
  'eth_getBalance',
  'eth_getTransactionReceipt',
  'eth_getTransactionCount',
  'eth_feeHistory',
  // EIP-2255 (only-read)
  'wallet_getPermissions',
  // EOA
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  // AA(EIP-5792)
  'wallet_getCapabilities',
  'wallet_sendCalls',
  'wallet_showCallsStatus',
  'wallet_getCallsStatus',
]);

export const MAX_SLIPPAGE = 300; // 3% (bps)
export const PARTNER_FEE_BPS = 30; // 0.3% — Lido DAO treasury
export const WHEN_PRICE_IMPACT_IS_HIGH_THAN = 3; // 3%
export const LIDO_APP_CODE = 'Lido Staking Widget';
export const COWSWAP_WIDGET_LOADING_TIMEOUT_MS = 1_000 * 60 * 2; // 2 minutes
export const MAX_ORDER_AGE_SECONDS = 60 * 30; // 30 minutes
export const MAX_ORDER_AGE_MINUTES = Math.floor(MAX_ORDER_AGE_SECONDS / 60);
export const TRADE_REPORT_EVENT_DEBOUNCE_MS = 3_000; // 3 seconds

export const COWSWAP_ENABLED_CHAIN_IDS = new Set<number>([
  mainnet.id,
  sepolia.id,
]); // mainnet, sepolia

export const COWSWAP_BASE_URL = 'https://cow-ipfs.testnet.fi/';

// there is barn.api.cow.fi staging for API, but UI(even staging) uses prod API
const COWSWAP_API_BASE_URL = 'https://api.cow.fi';

export const COWSWAP_APPDATA_API = (appDataHex: string, environment: string) =>
  `${COWSWAP_API_BASE_URL}/${environment}/api/v1/app_data/${appDataHex}`;
export const COWSWAP_ORDER_API = (orderUID: string, environment: string) =>
  `${COWSWAP_API_BASE_URL}/${environment}/api/v1/orders/${orderUID}`;

export const COWSWAP_API_TIMEOUT_MS = 30_000; // 30 seconds

export const DEX_SELL_TOKEN_LIST_URL = `${GITHUB_RAW_MAIN_PATH}/public/token-lists/withdrawals-dex-sell-tokenlist.json`;
export const DEX_BUY_TOKEN_LIST_URL = `${GITHUB_RAW_MAIN_PATH}/public/token-lists/withdrawals-dex-buy-tokenlist.json`;
