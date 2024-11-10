import { useCallback } from 'react';
// import { TypedDataDomain } from 'ethers';
import { Address, TypedDataDomain } from 'viem';
import invariant from 'tiny-invariant';

import { hexValue, splitSignature } from '@ethersproject/bytes';
import { MaxUint256 } from '@ethersproject/constants';
import { useSDK } from '@lido-sdk/react';
import { Erc20Abi, StethAbi } from '@lido-sdk/contracts';
import { useDappStatus } from 'modules/web3';

export type GatherPermitSignatureResult = {
  v: number;
  r: string;
  s: string;
  deadline: bigint;
  value: bigint;
  chainId: number;
  nonce: string;
  owner: string;
  spender: string;
};

type UseERC20PermitSignatureResult = {
  gatherPermitSignature: (
    amount: bigint,
  ) => Promise<GatherPermitSignatureResult>;
};

type UseERC20PermitSignatureProps<
  T extends Pick<Erc20Abi, 'nonces' | 'address'>,
> = {
  tokenProvider: T | null;
  spender: string;
};

const INFINITY_DEADLINE_VALUE = MaxUint256;

const isStethPermit = (provider: unknown): provider is StethAbi => {
  return Boolean(
    provider && typeof provider === 'object' && 'eip712Domain' in provider,
  );
};

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

export const useERC20PermitSignature = <
  T extends Pick<Erc20Abi, 'nonces' | 'address'>,
>({
  tokenProvider,
  spender,
}: UseERC20PermitSignatureProps<T>): UseERC20PermitSignatureResult => {
  const { address } = useDappStatus();

  const { providerWeb3, chainId } = useSDK();

  const gatherPermitSignature = useCallback(
    async (amount: bigint) => {
      invariant(chainId, 'chainId is needed');
      invariant(address, 'account is needed');
      invariant(providerWeb3, 'providerWeb3 is needed');
      invariant(tokenProvider, 'tokenProvider is needed');

      const deadline = INFINITY_DEADLINE_VALUE;

      let domain: TypedDataDomain;
      if (isStethPermit(tokenProvider)) {
        const eip712Domain = await tokenProvider.eip712Domain();
        domain = {
          name: eip712Domain.name,
          version: eip712Domain.version,
          chainId: eip712Domain.chainId.toNumber(),
          verifyingContract: eip712Domain.verifyingContract as Address,
        };
      } else {
        domain = {
          name: 'Wrapped liquid staked Ether 2.0',
          version: '1',
          chainId,
          verifyingContract: tokenProvider.address as Address,
        };
      }
      const nonce = await tokenProvider.nonces(address);

      const message = {
        owner: address,
        spender,
        value: amount.toString(),
        nonce: hexValue(nonce),
        deadline: hexValue(deadline),
      };
      const types = {
        Permit: EIP2612_TYPE,
      };

      const signer = providerWeb3.getSigner();

      return signer
        ._signTypedData(domain, types, message)
        .then(splitSignature)
        .then((signature) => {
          return {
            v: signature.v,
            r: signature.r,
            s: signature.s,
            value: amount,
            deadline: deadline.toBigInt(),
            chainId: chainId,
            nonce: message.nonce,
            owner: address,
            spender,
          };
        });
    },
    [chainId, address, providerWeb3, tokenProvider, spender],
  );

  return { gatherPermitSignature };
};
