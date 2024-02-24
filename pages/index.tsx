import { getOneConfig } from 'config/one-config/utils';
const { ipfsMode } = getOneConfig();

import { StakePage } from 'features/stake';
import HomePageIpfs from 'features/ipfs/home-page-ipfs';

export default ipfsMode ? HomePageIpfs : StakePage;
