import { getConfig } from 'config';
const { ipfsMode } = getConfig();

import { StakePage } from 'features/stake';
import HomePageIpfs from 'features/ipfs/home-page-ipfs';

export default ipfsMode ? HomePageIpfs : StakePage;
