import type { Hex } from 'viem';

/** wallet_getCapabilities result: capabilities by chain id, 0 for all */
export type CapabilitiesByChain =
  Record<number, Record<string, unknown> | undefined> | undefined;

type Capability = {
  supported?: boolean;
  status?: string;
};

const isCapabilitySupported = (capability?: Capability) => {
  if (!capability) return false;
  return typeof capability.status === 'string'
    ? capability.status === 'supported'
    : !!capability.supported;
};

/**
 * EIP-5792 atomic batches on `chainId` (`atomic`, or the legacy
 * `atomicBatch`): the wallet is an AA wallet there. Capabilities are keyed
 * by chain, `0` for every chain; no capabilities (loading, failed, plain
 * EOA) is false. The same rule as useAA, for a given chain instead of the
 * dapp chain.
 */
export const isAtomicBatchSupported = (
  capabilities: CapabilitiesByChain,
  chainId: number,
): boolean => {
  if (!capabilities) return false;
  const merged = { ...capabilities[0], ...capabilities[chainId] } as {
    atomic?: Capability;
    atomicBatch?: Capability;
  };
  return (
    isCapabilitySupported(merged.atomic) ||
    isCapabilitySupported(merged.atomicBatch)
  );
};

/**
 * The account's code makes it a contract wallet: some bytecode, but not an
 * EOA (empty) nor an EIP-7702 delegated EOA (0xef0100...), which still
 * pays its own gas. The same rule as useIsSmartAccount.
 */
export const isContractCode = (code: Hex | undefined) =>
  !!code && code !== '0x' && !code.startsWith('0xef0100');
