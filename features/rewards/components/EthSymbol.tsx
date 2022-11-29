import { Box } from '@lidofinance/lido-ui';
import { constants } from 'ethers';

// TODO: move to separate folders
const EthSymbol = () => (
  <Box display="inline" fontWeight={700} pr="5px">
    {constants.EtherSymbol}
  </Box>
);

export default EthSymbol;
