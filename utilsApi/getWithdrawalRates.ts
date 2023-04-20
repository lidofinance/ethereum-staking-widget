import { BigNumber } from 'ethers';
import { getOneInchRate } from './getOneInchRate';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { responseTimeExternalMetricWrapper, serverLogger } from 'utilsApi';
import { standardFetcher } from 'utils/standardFetcher';

type getWithdrawalRatesParams = {
  amount: BigNumber;
};

type getWithdrawalRatesResult = { name: string; rate: number | null }[];

const STETH_ADDRESS = getTokenAddress(CHAINS.Mainnet, TOKENS.STETH);
const SWAP_MIN_AMOUNT = BigNumber.from('100000000000000000'); // amount lower error out price rates

export const getWithdrawalRates = async ({
  amount,
}: getWithdrawalRatesParams): Promise<getWithdrawalRatesResult> => {
  const _amount = amount.lte(SWAP_MIN_AMOUNT) ? SWAP_MIN_AMOUNT : amount;
  return Promise.all([
    getOneInchRate(
      STETH_ADDRESS,
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      _amount,
    )
      .catch(() => null)
      .then((r) => ({ name: '1inch', rate: r })),
    getParaSwapRate(_amount)
      .catch(() => null)
      .then((r) => ({ name: 'paraswap', rate: r })),
    getCowSwapRate(_amount)
      .catch(() => {
        return null;
      })
      .then((r) => ({ name: 'cowswap', rate: r })),
  ]).then((rates) => {
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
  });
};

type ParaSwapPriceResponsePartial = {
  priceRoute: {
    srcAmount: string;
    destAmount: string;
  };
};

const getParaSwapRate = async (amount: BigNumber) => {
  serverLogger.debug('Getting exchange rate from ParaSwap');
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
  const data = await responseTimeExternalMetricWrapper({
    payload: api,
    request: () => standardFetcher<ParaSwapPriceResponsePartial>(url),
  });

  if (!data || !data.priceRoute) {
    serverLogger.error('Request to paraswap failed');
    return null;
  }

  const rate =
    BigNumber.from(data.priceRoute.destAmount)
      .mul(BigNumber.from(100000))
      .div(BigNumber.from(data.priceRoute.srcAmount))
      .toNumber() / 100000;
  serverLogger.debug('Rate on paraswap: ' + rate);

  return rate;
};

type CowSwapQuoteResponsePartial = {
  quote: {
    sellAmount: '19985771215803322932';
    buyAmount: '19966856269983766837';
  };
};

const getCowSwapRate = async (amount: BigNumber) => {
  serverLogger.debug('Getting exchange rate from CowSwap');

  const payload = {
    sellToken: STETH_ADDRESS,
    buyToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    from: '0x0000000000000000000000000000000000000000',
    receiver: '0x0000000000000000000000000000000000000000',
    partiallyFillable: false,
    kind: 'sell',
    sellAmountBeforeFee: amount.toString(),
  };

  const url = `https://api.cow.fi/mainnet/api/v1/quote`;

  const data = await responseTimeExternalMetricWrapper({
    payload: url + payload,
    request: () =>
      standardFetcher<CowSwapQuoteResponsePartial>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
  });

  const rate =
    BigNumber.from(data.quote.buyAmount)
      .mul(BigNumber.from(100000))
      .div(BigNumber.from(data.quote.sellAmount))
      .toNumber() / 100000;
  serverLogger.debug('Rate on cowswap: ' + rate);
  return rate;
};
