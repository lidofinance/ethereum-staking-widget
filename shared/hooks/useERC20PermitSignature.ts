import { useCallback } from 'react';
import { splitSignature } from '@ethersproject/bytes';
import { parseEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { useSDK } from '@lido-sdk/react';
import { BigNumber } from 'ethers';

import { Eip2612 } from 'generated';

import { PermitType } from './useGetPermitDomain';
import { useGetPermitData } from './useGetPermitData';

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
  token: TOKENS;
  tokenProvider: T | null;
  spender: string;
  tokenAddress?: string;
};

export const useERC20PermitSignature = <
  T extends Pick<Eip2612, 'nonces' | 'address'>,
>(
  props: UseERC20PermitSignatureProps<T>,
): UseERC20PermitSignatureResult => {
  const { value, tokenProvider, spender } = props;

  const { account, providerWeb3 } = useSDK();
  const getPermitData = useGetPermitData({ tokenProvider, spender, value });

  const gatherPermitSignature = useCallback(async () => {
    if (!account) return;

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
