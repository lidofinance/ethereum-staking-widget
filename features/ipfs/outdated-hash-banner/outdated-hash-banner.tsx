import { Button, Modal } from '@lidofinance/lido-ui';
import { dynamics } from 'config';
import { WarningIcon, Wrapper, WarningText } from './styles';
import { useIpfsHashCheck } from './use-ipfs-hash-check';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

export const OutdatedHashBanner = dynamics.ipfsMode
  ? () => {
      const { isUpdateAvailable, data, setConditionsAccepted } =
        useIpfsHashCheck();

      return (
        <NoSsrWrapper>
          <Modal open={isUpdateAvailable}>
            <Wrapper>
              <WarningIcon />
              <WarningText>
                This is not the most recent version of IPFS Widget
              </WarningText>
              <a
                href={data.remoteCidLink}
                target="_self"
                rel="noopener noreferrer"
              >
                <Button size="sm" fullwidth variant="filled">
                  Get to the actual version
                </Button>
              </a>
              <Button
                size="sm"
                fullwidth
                color="error"
                variant="outlined"
                onClick={() => setConditionsAccepted(true)}
              >
                Accept risks and use the current version
              </Button>
            </Wrapper>
          </Modal>
        </NoSsrWrapper>
      );
    }
  : () => null;
