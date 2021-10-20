export const CONCURRENCY_LIMIT = 5;
export const TERRA_NODE_URL = process.env.TERRA_NODE_URL;
export const STAKERS_ADDRESS = 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp';
export const HUB_CONTRACT = 'terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts';
export const CRON_JOB = '*/10 * * * *';
export const MAX_REQUESTS_PER_RUN = 10;
export const TAIL_LENGTH = 14 * 24 * 6; // 14 days and aprox 1 reward per 10 min
export const DEFAULT_STAKERS = {
  count: 6342,
  lastCounted: 'terra1ll7g0gny3r5jhsctxf7q83rjnk20vyd628f9rj',
};
export const DEFAULT_CLAIMS = {
  amount: 17317490894844,
  lastBlock: { height: 4729116, time: '2021-09-30T21:26:35.000Z' },
  tail: [
    {
      amount: 1518671931,
      block: {
        height: 4728953,
        time: 1633036043000,
      },
      lunaPrice: 38.44691471911189,
      totalStaked: 64864072595741,
    },
    {
      amount: 644632906,
      block: {
        height: 4728987,
        time: 1633036288000,
      },
      lunaPrice: 38.44691471911189,
      totalStaked: 64864072595741,
    },
    {
      amount: 896427819,
      block: {
        height: 4729039,
        time: 1633036655000,
      },
      lunaPrice: 38.44691471911189,
      totalStaked: 64864072595741,
    },
    {
      amount: 1415674455,
      block: {
        height: 4729116,
        time: 1633037195000,
      },
      lunaPrice: 38.244173176155236,
      totalStaked: 64865848482704,
    },
    {
      amount: 178383292,
      block: {
        height: 4729125,
        time: 1633037260000,
      },
      lunaPrice: 38.244173176155236,
      totalStaked: 64865848482704,
    },
    {
      amount: 1499685958,
      block: {
        height: 4729211,
        time: 1633037867000,
      },
      lunaPrice: 38.25965082998237,
      totalStaked: 64866550290038,
    },
    {
      amount: 621004405,
      block: {
        height: 4729245,
        time: 1633038104000,
      },
      lunaPrice: 38.25965082998237,
      totalStaked: 64866550290038,
    },
    {
      amount: 891071411,
      block: {
        height: 4729297,
        time: 1633038470000,
      },
      lunaPrice: 38.442954956271734,
      totalStaked: 64866943995528,
    },
    {
      amount: 1253796763,
      block: {
        height: 4729373,
        time: 1633039008000,
      },
      lunaPrice: 38.22521292475711,
      totalStaked: 64866959607051,
    },
    {
      amount: 178109273,
      block: {
        height: 4729382,
        time: 1633039073000,
      },
      lunaPrice: 38.22521292475711,
      totalStaked: 64866959607051,
    },
    {
      amount: 1498527208,
      block: {
        height: 4729468,
        time: 1633039677000,
      },
      lunaPrice: 38.13637562666965,
      totalStaked: 64867113614045,
    },
    {
      amount: 628907475,
      block: {
        height: 4729501,
        time: 1633039914000,
      },
      lunaPrice: 38.13637562666965,
      totalStaked: 64867113614045,
    },
    {
      amount: 977719912,
      block: {
        height: 4729555,
        time: 1633040284000,
      },
      lunaPrice: 38.065718486518584,
      totalStaked: 64869213714045,
    },
    {
      amount: 1327015697,
      block: {
        height: 4729631,
        time: 1633040820000,
      },
      lunaPrice: 38.065718486518584,
      totalStaked: 64869213714045,
    },
    {
      amount: 174068888,
      block: {
        height: 4729641,
        time: 1633040888000,
      },
      lunaPrice: 38.065718486518584,
      totalStaked: 64869213714045,
    },
    {
      amount: 1485101817,
      block: {
        height: 4729729,
        time: 1633041498000,
      },
      lunaPrice: 38.03726242213342,
      totalStaked: 64899226002621,
    },
    {
      amount: 611822978,
      block: {
        height: 4729762,
        time: 1633041730000,
      },
      lunaPrice: 38.15619418594898,
      totalStaked: 64909532002392,
    },
    {
      amount: 952122216,
      block: {
        height: 4729816,
        time: 1633042107000,
      },
      lunaPrice: 38.15619418594898,
      totalStaked: 64909532002392,
    },
    {
      amount: 1312494212,
      block: {
        height: 4729891,
        time: 1633042638000,
      },
      lunaPrice: 38.31651781832484,
      totalStaked: 64909574284164,
    },
    {
      amount: 179338982,
      block: {
        height: 4729903,
        time: 1633042719000,
      },
      lunaPrice: 38.31651781832484,
      totalStaked: 64909574284164,
    },
    {
      amount: 1552187759,
      block: {
        height: 4729990,
        time: 1633043324000,
      },
      lunaPrice: 38.014084965907344,
      totalStaked: 64909574284164,
    },
    {
      amount: 527151393,
      block: {
        height: 4730022,
        time: 1633043546000,
      },
      lunaPrice: 38.014084965907344,
      totalStaked: 64909574284164,
    },
    {
      amount: 939650947,
      block: {
        height: 4730076,
        time: 1633043923000,
      },
      lunaPrice: 37.85609310853069,
      totalStaked: 64910001220030,
    },
  ],
};

export const VALIDATORS_CACHE_TIME_TS = 5 * 60 * 1000;
export const VALIDATORS_CACHE_KEY = 'terraValidators';
