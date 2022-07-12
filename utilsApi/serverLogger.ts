import getConfig from 'next/config';
import { serverLoggerFactory } from 'backend-blocks/utils';

const { serverRuntimeConfig } = getConfig();
const {
  infuraApiKey,
  alchemyApiKey,
  subgraphMainnet,
  subgraphRopsten,
  subgraphRinkeby,
  subgraphGoerli,
  subgraphKovan,
  subgraphKintsugi,
} = serverRuntimeConfig;

export const serverLogger = serverLoggerFactory([
  infuraApiKey,
  alchemyApiKey,
  subgraphMainnet,
  subgraphRopsten,
  subgraphRinkeby,
  subgraphGoerli,
  subgraphKovan,
  subgraphKintsugi,
]);
