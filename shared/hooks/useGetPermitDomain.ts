import { StethPermitAbi, Eip2612 } from 'generated';
import { useCallback } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';

export enum PermitType {
  AMOUNT = 1,
  ALLOWED = 2,
}

const isStethPermit = (provider: unknown): provider is StethPermitAbi => {
  if (typeof provider !== 'object' || provider === null) return false;
  if ('eip712Domain' in provider) return true;

  return false;
};

export type PermitProvider = Pick<Eip2612, 'nonces' | 'address'> & {
  eip712Domain?: StethPermitAbi['eip712Domain'];
};

export type UseGetPermitDomainProps<T extends PermitProvider> = {
  tokenProvider: T | null;
};

export const useGetPermitDomain = <T extends PermitProvider>(
  props: UseGetPermitDomainProps<T>,
) => {
  const { tokenProvider } = props;
  const { account, chainId } = useWeb3();

  return useCallback(async () => {
    if (!chainId || !account || !tokenProvider) return;

    let domainData = {
      name: 'Wrapped liquid staked Ether 2.0',
      version: '1',
      chainId,
      verifyingContract: tokenProvider.address,
    };
    const isSteth = isStethPermit(tokenProvider);

    if (isSteth) {
      const eip712Domain = await tokenProvider.eip712Domain();
      domainData = {
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: eip712Domain.chainId.toNumber(),
        verifyingContract: eip712Domain.verifyingContract,
      };
    }

    return { ...domainData, type: PermitType.AMOUNT };
  }, [account, chainId, tokenProvider]);
};
