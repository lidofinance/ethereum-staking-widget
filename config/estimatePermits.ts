import { CHAINS } from '@lido-sdk/constants';
import isClientSide from 'utils/isClientSide';

if (isClientSide()) {
  throw new Error('server side secrets exposed!');
}

type PermitData = {
  r: string;
  s: string;
  v: number;
  value: string;
  deadline: string;
};

// Security note:
// Permits are as safe to be shared on frontend as they are to be broadcast openly in mempool
// TODO recheck zhejang and add other chains
export const ESTIMATE_ACCOUNT_PERMITS: {
  [key in CHAINS]?: { steth_permit: PermitData; wsteth_permit: PermitData };
} = {
  [CHAINS.Zhejiang]: {
    steth_permit: {
      r: '0xf1baeb202095cd7f5df5aa3c915a9482d066d8cc62661089ca57fb6d2e6e283d',
      s: '0x7e9344e57b670352c456f587295ec7ef6a7ae9093df07b1899ffa7f675262ba4',
      v: 28,
      value: '1000000000000000',
      deadline:
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    },
    wsteth_permit: {
      r: '0x1a53ccbabf77df1b31f28a8153e3a766c761ef6cba2998df1c96d8bddbbae8c9',
      s: '0x62d2e777d91cfa9ff42d3c3c0a5d52384f7dd5c3596074e25c5682134e9e4105',
      v: 28,
      value: '1000000000000000',
      deadline:
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    },
  },
  [CHAINS.Goerli]: {
    steth_permit: {
      r: '0x8bb9510ea8b9770dd65f370c61462c1377882bea2e3781a048d64f4cec9c1f61',
      s: '0x6e9f2a5368b4ca200460d44d1fe7bd5445736200c566b39a118a3d34bacd9cca',
      v: 27,
      value: '1000000000000000',
      deadline:
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    },
    wsteth_permit: {
      r: '0x545bcac878052e1ee7b66f3116c33bfb39ad2e050db4ab0db1ebd6155133f495',
      s: '0x4a66466cad749f1d5d4521d2b407e3da335115adf0be5a779c100721e792758f',
      v: 28,
      value: '1000000000000000',
      deadline:
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    },
  },
} as const;
