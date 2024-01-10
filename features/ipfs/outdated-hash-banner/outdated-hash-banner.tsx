import { Text } from '@lidofinance/lido-ui';
import { dynamics } from 'config';
import { HashBanner, ArrowLink, Arrow } from './styles';
import { useIpfsHashCheck } from './use-ipfs-hash-check';

export const OutdatedHashBanner = dynamics.ipfsMode
  ? () => {
      const { isUpdateAvailable } = useIpfsHashCheck();
      if (isUpdateAvailable)
        return (
          <HashBanner>
            <Text weight={700} size="sm">
              This is not the most recent version of IPFS Widget
            </Text>
            <Text weight={400} size="xxs">
              Please click below to access the latest version of IPFS.
              <br />
              <ArrowLink href={dynamics.ipfsEns}>
                Get to the latest version here
                <Arrow />
              </ArrowLink>
            </Text>
          </HashBanner>
        );
    }
  : () => null;
