import { Box } from '@lidofinance/lido-ui';
import { ETHER_SYMBOL } from 'modules/web3';

// TODO: move to separate folders
const EthSymbol = () => (
  <Box display="inline" fontWeight={700} pr="5px">
    {ETHER_SYMBOL}
  </Box>
);

export default EthSymbol;
