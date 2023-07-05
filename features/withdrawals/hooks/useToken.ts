import { useMemo } from 'react';
import { TOKENS } from '@lido-sdk/constants';
import {
  useWSTETHContractWeb3,
  useSTETHBalance,
  useWSTETHBalance,
  useSTETHContractWeb3,
} from '@lido-sdk/react';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useRequestForm } from 'features/withdrawals//contexts/request-form-context';

export const useToken = () => {
  const { selectedToken, setSelectedToken } = useRequestForm();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const stethContractWeb3 = useSTETHContractWeb3();
  // TODO conditional balance fetch
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();
  const isSteth = selectedToken === TOKENS.STETH;
  const tokenContract = isSteth ? stethContractWeb3 : wstethContractWeb3;
  const tokenBalance = isSteth ? stethBalance.data : wstethBalance.data;
  const tokenLabel = getTokenDisplayName(selectedToken);
  // we recalculate only on data change relevant to current token
  return useMemo(() => {
    return {
      setToken: setSelectedToken,
      token: selectedToken,
      tokenLabel,
      tokenContract,
      tokenBalance,
    } as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken, tokenLabel, tokenContract, tokenBalance]);
};
