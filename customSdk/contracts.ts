import { contractHooksFactory } from '@lido-sdk/react';
import { WithdrawalRequestNFTAbi__factory } from 'generated';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';

import { StethPermitAbi__factory } from 'generated';

const WithdrawalRequestNFTContracts: { [key in CHAINS]?: string } = {
  [CHAINS.Mainnet]: '0x00',
  [CHAINS.Goerli]: '0xCF117961421cA9e546cD7f50bC73abCdB3039533',
  [CHAINS.Zhejiang]: '0x4c1F6cA213abdbc19b27f2562d7b1A645A019bD9',
};

export const getWithdrawalRequestNFTAddress = (chainId: CHAINS): string => {
  return WithdrawalRequestNFTContracts[chainId] || '0x00';
};

const withdrawalRequestNFT = contractHooksFactory(
  WithdrawalRequestNFTAbi__factory,
  (chainId) => getWithdrawalRequestNFTAddress(chainId),
);
export const useWithdrawalRequestNFTRPC = withdrawalRequestNFT.useContractRPC;
export const useWithdrawalRequestNFTWeb3 = withdrawalRequestNFT.useContractWeb3;

const steth = contractHooksFactory(StethPermitAbi__factory, (chain) =>
  getTokenAddress(chain, TOKENS.STETH),
);
export const useSTETHContractRPC = steth.useContractRPC;
export const useSTETHContractWeb3 = steth.useContractWeb3;
