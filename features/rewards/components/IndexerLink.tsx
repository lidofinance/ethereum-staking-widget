import { Box, External as ExternalLinkIcon } from '@lidofinance/lido-ui';

import { config } from 'config';
import { getEtherscanTxLink } from 'utils/etherscan';

// TODO: move to separate folders
type Props = {
  transactionHash: string;
};

const IndexerLink = ({ transactionHash }: Props) => {
  if (!transactionHash) return null;

  const link = getEtherscanTxLink(config.defaultChain, transactionHash);
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Box ml="1px" mt="-2px" height="12px" width="12px">
        <ExternalLinkIcon />
      </Box>
    </a>
  );
};

export default IndexerLink;
