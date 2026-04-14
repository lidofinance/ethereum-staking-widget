import { useCallback, useState } from 'react';
import { maxUint256, type Address } from 'viem';
import { useWalletClient } from 'wagmi';

import {
  useAllowance,
  Erc20AllowanceAbi,
} from 'modules/web3/hooks/use-allowance';
import { useTxConfirmation } from 'modules/web3/hooks/use-tx-conformation';
import { useDappStatus } from 'modules/web3';
import { useAddressValidation } from 'providers/address-validation-provider';

import { COW_VAULT_RELAYER } from '../consts';
import { isNativeEth } from './cow-tokens';

type UseCowApprovalProps = {
  token: Address;
  amount: bigint | null;
};

export const useCowApproval = ({ token, amount }: UseCowApprovalProps) => {
  const { data: walletClient } = useWalletClient();
  const { address: walletAddress } = useDappStatus();
  const { validateAddress } = useAddressValidation();
  const waitForTx = useTxConfirmation();
  const [isApproving, setIsApproving] = useState(false);

  // Native ETH doesn't need approval
  const isEth = isNativeEth(token);

  const { data: allowance, refetch: refetchAllowance } = useAllowance({
    token: isEth ? undefined : token,
    account: walletAddress as Address | undefined,
    spender: COW_VAULT_RELAYER,
  });

  const needsApproval =
    !isEth &&
    amount !== null &&
    amount > 0n &&
    (allowance === undefined || allowance < amount);

  const approve = useCallback(async () => {
    if (!walletClient?.account?.address) return;

    const isValid = await validateAddress(walletClient.account.address);
    if (!isValid) return;

    setIsApproving(true);
    try {
      const hash = await walletClient.writeContract({
        abi: Erc20AllowanceAbi,
        address: token,
        functionName: 'approve',
        args: [COW_VAULT_RELAYER, maxUint256],
      });

      await waitForTx(hash);
      await refetchAllowance();
    } finally {
      setIsApproving(false);
    }
  }, [walletClient, token, validateAddress, waitForTx, refetchAllowance]);

  return { needsApproval, isApproving, approve, allowance };
};
