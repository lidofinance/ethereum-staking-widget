type BalancerResponseMeta = {
  pool: {
    address: string;
    lpToken: {
      symbol: string;
      address: string;
    };
    tokens: {
      symbol: 'WETH' | 'wstETH';
      address: string;
    }[];
  };
  incentives: Record<
    string,
    {
      token: {
        symbol: 'BAL' | 'LDO';
        address: string;
      };
    }
  >;
};

export type BalancerResponse = {
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
  meta: BalancerResponseMeta;
};
