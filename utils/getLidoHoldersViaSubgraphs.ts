import { API_THEGRAPH_SUBGRAPHS_LIDO_ENDPOINT } from 'config';
import { standardFetcher } from './standardFetcher';

interface LidoHolders extends Response {
  data: {
    stats: {
      uniqueAnytimeHolders: string;
      uniqueHolders: string;
    };
  };
}

type GetLidoHoldersViaSubgraphs = () => Promise<LidoHolders>;

export const getLidoHoldersViaSubgraphs: GetLidoHoldersViaSubgraphs =
  async () => {
    const query = `
    query {
      stats (id: "") {
        uniqueHolders
        uniqueAnytimeHolders
      }
    }
  `;

    const params = {
      method: 'POST',
      body: JSON.stringify({ query }),
    };

    return standardFetcher<LidoHolders>(
      API_THEGRAPH_SUBGRAPHS_LIDO_ENDPOINT,
      params,
    );
  };
