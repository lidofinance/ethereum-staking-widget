import { useReadContract } from 'wagmi';
import { erc20abi } from '@lidofinance/lido-ethereum-sdk/erc20';

import { getTokenAddress } from 'config/networks/token-address';
import { TOKENS } from 'consts/tokens';
import { useDappStatus } from 'modules/web3';
import { useGGVUserShareState } from 'features/earn/vault-ggv/withdraw/hooks/use-ggv-shares-state';
import { useIsUnlocked } from 'features/earn/vault-ggv/withdraw/hooks/use-is-unlocked';

export const useUpgradableTokenBalances = () => {
  const { address, chainId, isDappActive } = useDappStatus();
  const enabled = isDappActive && !!address;

  const ggvShareStateQuery = useGGVUserShareState();
  const areGgvSharesTimeLocked = useIsUnlocked(
    Number(ggvShareStateQuery.data?.shareUnlockTime ?? 0),
  );

  const ggAddress = getTokenAddress(chainId, TOKENS.gg);
  const strethAddress = getTokenAddress(chainId, TOKENS.streth);
  const dvstethAddress = getTokenAddress(chainId, TOKENS.dvsteth);

  const gg = useReadContract({
    abi: erc20abi,
    address: ggAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: enabled && !!ggAddress },
  });

  const streth = useReadContract({
    abi: erc20abi,
    address: strethAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: enabled && !!strethAddress },
  });

  const dvsteth = useReadContract({
    abi: erc20abi,
    address: dvstethAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: enabled && !!dvstethAddress },
  });

  return {
    balances: {
      [TOKENS.gg]: areGgvSharesTimeLocked ? 0n : gg.data, // if GGV shares are time-locked, we consider the balance as 0 for upgrade purposes
      [TOKENS.streth]: streth.data,
      [TOKENS.dvsteth]: dvsteth.data,
    },
    isLoading: gg.isLoading || streth.isLoading || dvsteth.isLoading,
  };
};
