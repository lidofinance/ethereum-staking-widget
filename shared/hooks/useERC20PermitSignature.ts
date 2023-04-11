import { useCallback } from 'react';
import { splitSignature } from '@ethersproject/bytes';
import { parseEther } from '@ethersproject/units';
import { useSDK } from '@lido-sdk/react';
import { BigNumber } from 'ethers';

import { Eip2612 } from 'generated';

import { PermitType } from './useGetPermitDomain';
import { useGetPermitData } from './useGetPermitData';
import invariant from 'tiny-invariant';

export type GatherPermitSignatureResult = {
  v: number;
  r: string;
  s: string;
  deadline: BigNumber;
  value: BigNumber;
  chainId?: number;
  nonce?: string;
  owner: string;
  spender?: string;
  permitType?: PermitType;
};

type UseERC20PermitSignatureResult = {
  gatherPermitSignature: () => Promise<GatherPermitSignatureResult | undefined>;
};

type UseERC20PermitSignatureProps<
  T extends Pick<Eip2612, 'nonces' | 'address'>,
> = {
  value: string;
  tokenProvider: T | null;
  spender: string;
};

export const useERC20PermitSignature = <
  T extends Pick<Eip2612, 'nonces' | 'address'>,
>({
  value,
  tokenProvider,
  spender,
}: UseERC20PermitSignatureProps<T>): UseERC20PermitSignatureResult => {
  const { account, providerWeb3 } = useSDK();
  const getPermitData = useGetPermitData({ tokenProvider, spender, value });

  const gatherPermitSignature = useCallback(async () => {
    invariant(account, 'account is needed');
    const { data, message, domain, signatureDeadline } = await getPermitData();

    return providerWeb3
      ?.send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then((signature) => {
        return {
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: signatureDeadline,
          value: parseEther(value),
          chainId: domain?.chainId,
          nonce: message?.nonce,
          owner: account,
          spender,
          permitType: domain?.type,
        };
      });
  }, [account, getPermitData, providerWeb3, spender, value]);

  return { gatherPermitSignature };
};
