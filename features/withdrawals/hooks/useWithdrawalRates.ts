import { useLidoSWR } from '@lido-sdk/react';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import { BigNumber } from 'ethers';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { useEffect, useState } from 'react';
import { standardFetcher } from 'utils/standardFetcher';

type getWithdrawalRatesParams = {
  amount: BigNumber;
};

type getWithdrawalRatesResult = { name: string; rate: number | null }[];

const STETH_ADDRESS = getTokenAddress(CHAINS.Mainnet, TOKENS.STETH);
const SWAP_MIN_AMOUNT = BigNumber.from('100000000000000000'); // amount lower error out price rates
const RATE_PRECISION = 100000;
const RATE_PRECISION_BN = BigNumber.from(RATE_PRECISION);

const calculateRate = (src: BigNumber, dest: BigNumber) =>
  dest.mul(RATE_PRECISION_BN).div(src).toNumber() / RATE_PRECISION;

type OneInchQuotePartial = {
  toTokenAmount: string;
};

const getOneInchRate = async (amount: BigNumber) => {
  let rate;
  try {
    const api = `https://api.1inch.exchange/v3.0/1/quote`;
    const query = new URLSearchParams({
      fromTokenAddress: STETH_ADDRESS,
      toTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      amount: amount.toString(),
    });
    const url = `${api}?${query.toString()}`;
    const data: OneInchQuotePartial =
      await standardFetcher<OneInchQuotePartial>(url);

    rate = calculateRate(amount, BigNumber.from(data.toTokenAmount));
  } catch {
    rate = null;
  }
  return {
    name: '1inch',
    rate,
  };
};

type ParaSwapPriceResponsePartial = {
  priceRoute: {
    srcAmount: string;
    destAmount: string;
  };
};

const getParaSwapRate = async (amount: BigNumber) => {
  let rate;
  try {
    const api = `https://apiv5.paraswap.io/prices`;
    const query = new URLSearchParams({
      srcToken: STETH_ADDRESS,
      srcDecimals: '18',
      destToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      destDecimals: '18',
      side: 'SELL',
      excludeDirectContractMethods: 'true',
      userAddress: '0x0000000000000000000000000000000000000000',
      amount: amount.toString(),
      network: '1',
    });

    const url = `${api}?${query.toString()}`;
    const data: ParaSwapPriceResponsePartial =
      await standardFetcher<ParaSwapPriceResponsePartial>(url);

    rate = calculateRate(
      BigNumber.from(data.priceRoute.destAmount),
      BigNumber.from(data.priceRoute.srcAmount),
    );
  } catch {
    rate = null;
  }
  return {
    name: 'paraswap',
    rate,
  };
};

type CowSwapQuoteResponsePartial = {
  quote: {
    sellAmount: string;
    buyAmount: string;
  };
};

const getCowSwapRate = async (amount: BigNumber) => {
  let rate;
  try {
    const payload = {
      sellToken: STETH_ADDRESS,
      buyToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      from: '0x0000000000000000000000000000000000000000',
      receiver: '0x0000000000000000000000000000000000000000',
      partiallyFillable: false,
      kind: 'sell',
      sellAmountBeforeFee: amount.toString(),
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

    rate = calculateRate(
      BigNumber.from(data.quote.buyAmount),
      BigNumber.from(data.quote.sellAmount),
    );
  } catch {
    rate = null;
  }
  return {
    name: 'cowswap',
    rate,
  };
};

const getWithdrawalRates = async ({
  amount,
}: getWithdrawalRatesParams): Promise<getWithdrawalRatesResult> => {
  const capped_amount = amount.lte(SWAP_MIN_AMOUNT) ? SWAP_MIN_AMOUNT : amount;
  const rates = await Promise.all([
    getOneInchRate(capped_amount),
    getParaSwapRate(capped_amount),
    getCowSwapRate(capped_amount),
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
  amount: BigNumber;
};

export const useWithdrawalRates = ({ amount }: useWithdrawalRatesOptions) => {
  const debouncedRequestCount = useDebouncedValue(amount, 2000);
  const swr = useLidoSWR(
    ['swr:withdrawal-rates', debouncedRequestCount],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_, amount) => getWithdrawalRates({ amount: amount as BigNumber }),
    {
      isPaused: () => !amount || !amount._isBigNumber,
      revalidateOnFocus: false,
    },
  );

  // this keeps order stable even for updates
  const [stableSortedData, setStableSortedData] = useState(swr.data);
  useEffect(() => {
    swr.data &&
      setStableSortedData((old) => {
        if (old && old !== swr.data) {
          return old.map((old_rate) => ({
            ...old_rate,
            rate: swr.data?.find((r) => r.name === old_rate.name)?.rate ?? null,
          }));
        } else return swr.data;
      });
  }, [swr.data]);

  return {
    data: stableSortedData,
    get initialLoading() {
      return swr.initialLoading || !stableSortedData;
    },
    get loading() {
      return swr.loading || debouncedRequestCount !== amount;
    },
    get error() {
      return swr.error;
    },
    update: swr.update,
  };
};
