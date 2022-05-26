import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { subgraphEndpoint } = publicRuntimeConfig;

export const DEFAULT_API_ERROR_MESSAGE =
  'Something went wrong. Sorry, try again later :(';

export const ETHPLORER_TOKEN_ENDPOINT =
  'https://api.ethplorer.io/getTokenInfo/';

export const HEALTHY_RPC_SERVICES_ARE_OVER = 'Healthy RPC services are over!';

export const API_THEGRAPH_SUBGRAPHS_LIDO_ENDPOINT = subgraphEndpoint;
