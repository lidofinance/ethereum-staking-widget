import { NextApiRequest, NextApiResponse } from 'next';

export type API<T = void> = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<T>;

export type EthplorerResponse = {
  address: string;
  decimals: string;
  name: string;
  symbol: string;
  totalSupply: string;
  transfersCount: number;
  lastUpdated: number;
  slot: number;
  issuancesCount: number;
  holdersCount: number;
  website: string;
  telegram: string;
  twitter: string;
  reddit: string;
  image: string;
  coingecko: string;
  ethTransfersCount: 0;
  price: {
    rate: number;
    diff: number;
    diff7d: number;
    ts: number;
    marketCapUsd: number;
    availableSupply: number;
    volume24h: number;
    volDiff1: number;
    volDiff7: number;
    volDiff30: number;
    diff30d: number;
    currency: string;
  };
  publicTags: string[];
  countOps: number;
};

export type EthplorerWrappedDataResponse = {
  data: EthplorerResponse;
};
