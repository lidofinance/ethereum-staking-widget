import { dynamics } from 'config';

import { StakePage } from 'features/stake';
import { HomePageIpfs } from 'features/ipfs';

export default dynamics.ipfsMode ? HomePageIpfs : StakePage;
