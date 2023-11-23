import { dynamics } from 'config';

import HomePageRegular from 'features/home/home-page-regular';
import HomePageIpfs from 'features/ipfs/home-page-ipfs';

export default dynamics.ipfsMode ? HomePageIpfs : HomePageRegular;
