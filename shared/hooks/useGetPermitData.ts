import { useCallback } from 'react';
import { useSDK } from '@lido-sdk/react';
import { parseEther } from '@ethersproject/units';
import { ethers } from 'ethers';

import { PermitProvider, useGetPermitDomain } from './useGetPermitDomain';

const INFINITY_DEADLINE_VALUE = ethers.constants.MaxUint256;

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

type UseGetPermitDataProps<T extends PermitProvider> = {
  spender: string;
  value: string;
  tokenProvider: T | null;
};

export const useGetPermitData = <T extends PermitProvider>(
  props: UseGetPermitDataProps<T>,
) => {
  const { spender, value, tokenProvider } = props;
  const { account } = useSDK();
  const getDomain = useGetPermitDomain({ tokenProvider });

  const signatureDeadline = INFINITY_DEADLINE_VALUE;

  return useCallback(async () => {
    if (!account) return { signatureDeadline };

    const domain = await getDomain();
    const nonceNumber = await tokenProvider?.nonces(account);
    const parsedValue = parseEther(value).toString();
    const message = {
      owner: account,
      spender,
      value: parsedValue,
      nonce: nonceNumber?.toHexString(),
      deadline: signatureDeadline.toHexString(),
    };

    return {
      signatureDeadline,
      message,
      domain,
      data: JSON.stringify({
        types: {
          EIP712Domain: EIP712_DOMAIN_TYPE,
          Permit: EIP2612_TYPE,
        },
        domain,
        primaryType: 'Permit',
        message,
      }),
    };
  }, [account, getDomain, signatureDeadline, spender, tokenProvider, value]);
};
