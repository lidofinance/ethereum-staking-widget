import { config } from 'config';

import { StakePage } from 'features/stake';
import HomePageIpfs from 'features/ipfs/home-page-ipfs';

export default config.ipfsMode ? HomePageIpfs : StakePage;
