import { GetContractReturnType, Abi, Client, Address } from 'viem';

export type Contract = GetContractReturnType<Abi, Client, Address>;
