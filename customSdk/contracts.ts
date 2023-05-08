import { contractHooksFactory } from '@lido-sdk/react';
import { WithdrawalRequestNFTAbi__factory } from 'generated';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';

import { StethPermitAbi__factory } from 'generated';

const WithdrawalRequestNFTContracts: { [key in CHAINS]?: string } = {
  [CHAINS.Mainnet]: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
  [CHAINS.Goerli]: '0xCF117961421cA9e546cD7f50bC73abCdB3039533',
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
