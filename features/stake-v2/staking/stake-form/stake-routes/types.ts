import type { Address } from 'viem';

import type { TxFlow, useLidoSDK, useLidoSDKL2 } from 'modules/web3';

import type {
  CapabilitiesByChain,
  FormRoute,
  RoutePublicEnvironment,
  RouteSubmission,
  RouteSubmitResult,
  TokenOnChain,
  TransactionStageModalContextValue,
} from '../../../utils';

/** what the user picked: the route is chosen by it alone */
export type StakeRoutePair = {
  tokenIn: TokenOnChain;
  tokenOut: TokenOnChain;
};

/** validated form values, as a route takes them */
export type StakeRouteValues = StakeRoutePair & {
  amount: bigint;
  referral: string | null;
};

/** per-chain fast stake state from the remote config and the wallet */
export type L2StakeState = {
  /** why staking is off on the chain; null when it is on */
  unavailableReason: string | null;
  /** below it a pool shortfall is temporary (refill ~1h); undefined if unset */
  liquidityTargetEth?: bigint;
};

/** public environment: what quotes read with, no account needed */
export type StakeRouteQuoteEnvironment = RoutePublicEnvironment;

/** what route contexts need beyond the public environment */
export type StakeAccountEnvironment = {
  account: Address;
  getL2StakeState: (chainId: number) => L2StakeState;
  /** wallet_getCapabilities of the account, by chain */
  capabilities: CapabilitiesByChain;
};

/** what every route reads its context with, besides the pair */
export type StakeRouteEnvironment = StakeRouteQuoteEnvironment &
  StakeAccountEnvironment;

export type StakeRouteDeps = StakeRoutePair &
  StakeRouteEnvironment & {
    /**
     * EIP-5792 atomic batches on tokenIn's chain, derived from
     * `capabilities` per pair: the wallet prices the batch itself, and is a
     * smart account (gas can be sponsored) there
     */
    isAA: boolean;
  };

export type StakeRouteQuoteDeps = StakeRoutePair & StakeRouteQuoteEnvironment;

/** what a route promises for the entered amount */
export type StakeQuote = {
  amountOut: bigint;
};

export type StakeRouteSubmitTools = {
  txFlow: TxFlow;
  lidoSDK: ReturnType<typeof useLidoSDK>;
  /** the L2 SDK, on the wallet's chain: for L2 routes */
  lidoSDKL2: ReturnType<typeof useLidoSDKL2>;
  account: Address;
  /** the form's tx modal: the flow shows its stages there */
  dispatchTransactionModal: TransactionStageModalContextValue['dispatchTransactionModal'];
};

export type StakeRouteId = 'stake' | 'wrap-eth' | 'fast-stake';

export type StakeRouteUi = {
  submitLabel: string;
};

export type StakeRouteSpec = {
  id: StakeRouteId;
  pair: StakeRoutePair;
  values: StakeRouteValues;
  deps: StakeRouteDeps;
  quoteDeps: StakeRouteQuoteDeps;
  quote: StakeQuote;
  tools: StakeRouteSubmitTools;
  ui: StakeRouteUi;
};

/** one stake flow; see FormRoute */
export type StakeRoute<TContext = unknown> = FormRoute<
  StakeRouteSpec,
  TContext
>;

export type StakeRouteSubmission<TContext> = RouteSubmission<
  StakeRouteSpec,
  TContext
>;

export type StakeRouteSubmitResult = RouteSubmitResult<StakeRouteSpec>;
