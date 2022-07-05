import getConfig from 'next/config';
import { serverLoggerFactory } from '../backend-blocks';

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
