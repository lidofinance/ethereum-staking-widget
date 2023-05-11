import { useLidoSWR } from '@lido-sdk/react';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import { BigNumber } from 'ethers';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { useEffect, useMemo, useState } from 'react';
import { standardFetcher } from 'utils/standardFetcher';
import { useRequestForm } from '../contexts/request-form-context';
import { useWithdrawals } from '../contexts/withdrawals-context';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

type getWithdrawalRatesParams = {
  amount: BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
};

type RateResult = {
  name: string;
  rate: number | null;
  toReceive: BigNumber | null;
};

type getRate = (
  amount: BigNumber,
  token: TOKENS.STETH | TOKENS.WSTETH,
) => Promise<RateResult>;

type rateCalculationResult = ReturnType<typeof calculateRateReceive>;

type getWithdrawalRatesResult = RateResult[];

const RATE_PRECISION = 100000;
const RATE_PRECISION_BN = BigNumber.from(RATE_PRECISION);

const calculateRateReceive = (
  amount: BigNumber,
  src: BigNumber,
  dest: BigNumber,
) => {
  const _rate = dest.mul(RATE_PRECISION_BN).div(src);
  const toReceive = amount.mul(dest).div(src);
  const rate = _rate.toNumber() / RATE_PRECISION;
  return { rate, toReceive };
};

type OneInchQuotePartial = {
  toTokenAmount: string;
};

const getOneInchRate: getRate = async (amount, token) => {
  let rateInfo: rateCalculationResult | null;
  try {
    if (amount.isZero() || amount.isNegative()) {
      return {
        name: '1inch',
        rate: 0,
        toReceive: BigNumber.from(0),
      };
    }
    const capped_amount = amount;
    const api = `https://api.1inch.exchange/v3.0/1/quote`;
    const query = new URLSearchParams({
      fromTokenAddress: getTokenAddress(CHAINS.Mainnet, token),
      toTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      amount: amount.toString(),
    });
    const url = `${api}?${query.toString()}`;
    const data: OneInchQuotePartial =
      await standardFetcher<OneInchQuotePartial>(url);

    rateInfo = calculateRateReceive(
      amount,
      capped_amount,
      BigNumber.from(data.toTokenAmount),
    );
  } catch {
    rateInfo = null;
  }
  return {
    name: '1inch',
    rate: rateInfo?.rate ?? null,
    toReceive: rateInfo?.toReceive ?? null,
  };
};

type ParaSwapPriceResponsePartial = {
  priceRoute: {
    srcAmount: string;
    destAmount: string;
  };
};

const getParaSwapRate: getRate = async (amount, token) => {
  let rateInfo: rateCalculationResult | null;
  try {
    if (amount.isZero() || amount.isNegative()) {
      return {
        name: 'paraswap',
        rate: 0,
        toReceive: BigNumber.from(0),
      };
    }
    const capped_amount = amount;
    const api = `https://apiv5.paraswap.io/prices`;
    const query = new URLSearchParams({
      srcToken: getTokenAddress(CHAINS.Mainnet, token),
      srcDecimals: '18',
      destToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      destDecimals: '18',
      side: 'SELL',
      excludeDirectContractMethods: 'true',
      userAddress: '0x0000000000000000000000000000000000000000',
      amount: capped_amount.toString(),
      network: '1',
    });

    const url = `${api}?${query.toString()}`;
    const data: ParaSwapPriceResponsePartial =
      await standardFetcher<ParaSwapPriceResponsePartial>(url);

    rateInfo = calculateRateReceive(
      amount,
      BigNumber.from(data.priceRoute.srcAmount),
      BigNumber.from(data.priceRoute.destAmount),
    );
  } catch {
    rateInfo = null;
  }
  return {
    name: 'paraswap',
    rate: rateInfo?.rate ?? null,
    toReceive: rateInfo?.toReceive ?? null,
  };
};

type CowSwapQuoteResponsePartial = {
  quote: {
    sellAmount: string;
    buyAmount: string;
  };
};

const getCowSwapRate: getRate = async (amount, token) => {
  let rateInfo: rateCalculationResult | null;
  try {
    if (amount.isZero() || amount.isNegative()) {
      return {
        name: 'cowswap',
        rate: 0,
        toReceive: BigNumber.from(0),
      };
    }
    const capped_amount = amount;
    const payload = {
      sellToken: getTokenAddress(CHAINS.Mainnet, token),
      buyToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      from: '0x0000000000000000000000000000000000000000',
      receiver: '0x0000000000000000000000000000000000000000',
      partiallyFillable: false,
      kind: 'sell',
      sellAmountBeforeFee: capped_amount.toString(),
    };

    const data: CowSwapQuoteResponsePartial = await standardFetcher(
      `https://api.cow.fi/mainnet/api/v1/quote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    rateInfo = calculateRateReceive(
      amount,
      BigNumber.from(data.quote.sellAmount),
      BigNumber.from(data.quote.buyAmount),
    );
  } catch {
    rateInfo = null;
  }
  return {
    name: 'cowswap',
    rate: rateInfo?.rate ?? null,
    toReceive: rateInfo?.toReceive ?? null,
  };
};

const getWithdrawalRates = async ({
  amount,
  token,
}: getWithdrawalRatesParams): Promise<getWithdrawalRatesResult> => {
  const rates = await Promise.all([
    getOneInchRate(amount, token),
    getParaSwapRate(amount, token),
    getCowSwapRate(amount, token),
  ]);

  // sort by rate, then alphabetic
  rates.sort((r1, r2) => {
    const rate1 = r1.rate ?? 0;
    const rate2 = r2.rate ?? 0;
    if (rate1 == rate2) {
      if (r1.name < r2.name) {
        return -1;
      }
      if (r1.name > r2.name) {
        return 1;
      }
      return 0;
    }
    return rate2 - rate1;
  });

  return rates;
};

type useWithdrawalRatesOptions = {
  fallbackValue?: BigNumber;
};

export const useWithdrawalRates = ({
  fallbackValue,
}: useWithdrawalRatesOptions = {}) => {
  const { inputValueBN } = useRequestForm();
  const { selectedToken } = useWithdrawals();
  const fallbackedAmount =
    fallbackValue && inputValueBN.lte(0) ? fallbackValue : inputValueBN;
  const debouncedAmount = useDebouncedValue(fallbackedAmount, 2000);
  const swr = useLidoSWR(
    ['swr:withdrawal-rates', debouncedAmount, selectedToken],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_, amount, selectedToken) =>
      getWithdrawalRates({
        amount: amount as BigNumber,
        token: selectedToken as TOKENS.STETH | TOKENS.WSTETH,
      }),
    {
      ...STRATEGY_LAZY,
      isPaused: () => !debouncedAmount || !debouncedAmount._isBigNumber,
    },
  );

  // this keeps order stable even for updates
  const [stableSortedData, setStableSortedData] = useState(swr.data);
  useEffect(() => {
    swr.data &&
      setStableSortedData((old) => {
        if (old && old !== swr.data) {
          return old.map((oldData) => {
            const newData = swr.data?.find((r) => r.name === oldData.name);
            if (!newData) return oldData;
            return {
              ...oldData,
              ...newData,
            };
          });
        } else return swr.data;
      });
  }, [swr.data]);

  const bestRate = useMemo(() => {
    return swr.data?.[0]?.rate ?? null;
  }, [swr.data]);

  return {
    amount: fallbackedAmount,
    bestRate,
    selectedToken: selectedToken as TOKENS.WSTETH | TOKENS.STETH,
    data: stableSortedData,
    get initialLoading() {
      return !stableSortedData && swr.initialLoading;
    },
    get loading() {
      return swr.loading || !debouncedAmount.eq(fallbackedAmount);
    },
    get error() {
      return swr.error;
    },
    update: swr.update,
  };
};
