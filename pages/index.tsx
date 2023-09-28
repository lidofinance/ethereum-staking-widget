import { dynamics } from 'config';

import HomePageRegular from './_home/home-page-regular';
import HomePageIpfs from './_home/home-page-ipfs';

export default dynamics.ipfsMode ? HomePageIpfs : HomePageRegular;
