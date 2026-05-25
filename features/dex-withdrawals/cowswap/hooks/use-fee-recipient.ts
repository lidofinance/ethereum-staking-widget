import invariant from 'tiny-invariant';

import { useDappStatus } from 'modules/web3';
import { getContractAddress } from 'config/networks/contract-address';

export const useFeeRecipient = () => {
  const { chainId } = useDappStatus();
  const daoAgentAddress = getContractAddress(chainId, 'daoAgent');
  invariant(
    daoAgentAddress,
    'DAO Agent address is not defined for current network',
  );
  return daoAgentAddress;
};
