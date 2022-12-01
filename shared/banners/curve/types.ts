type CurveResponseMeta = {
  pool: {
    address: string;
    lpToken: {
      symbol: string;
      address: string;
    };
    tokens: {
      symbol: 'ETH' | 'stETH';
      address: string;
    }[];
  };
  incentives: Record<
    string,
    {
      token: {
        symbol: 'CRV' | 'LDO';
        address: string;
      };
    }
  >;
};

export type CurveResponse = {
  data: {
    timeUnix: number;
    totalApr: number;
    totalApy: number;
    incentives: {
      id: number;
      type: 'rewards' | 'fees' | 'steth';
      active: boolean;
      apr: number;
    }[];
    totalValueLockedInUsd: number;
    dayTradingVolumeInUsd: number;
    dayTradingVolumeInEth: number;
  };
  meta: CurveResponseMeta;
};
