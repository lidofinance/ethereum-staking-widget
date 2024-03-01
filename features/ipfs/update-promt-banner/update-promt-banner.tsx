import { Button, Modal } from '@lidofinance/lido-ui';
import { dynamics } from 'config';
import { WarningIcon, Wrapper, WarningText } from './styles';
import { useVersionCheck } from './use-version-check';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

const warningTextContent = (
  isUpdateAvailable: boolean,
  isVersionUnsafe: boolean,
) => {
  switch (true) {
    case dynamics.ipfsMode && isVersionUnsafe:
      return 'This version of IPFS Widget is deemed not safe to use';
    case dynamics.ipfsMode && isUpdateAvailable:
      return 'This is not the most recent version of IPFS Widget';
    case isVersionUnsafe:
      return 'Staking Widget is not safe to use right now';
    default:
      return '';
  }
};

export const UpgradePromtBanner = () => {
  const { isUpdateAvailable, data, setConditionsAccepted, isVersionUnsafe } =
    useVersionCheck();

  return (
    <NoSsrWrapper>
      <Modal open={isUpdateAvailable || isVersionUnsafe}>
        <Wrapper>
          <WarningIcon />
          <WarningText>
            {warningTextContent(isUpdateAvailable, isVersionUnsafe)}
          </WarningText>
          {isUpdateAvailable && (
            <a
              href={data.remoteCidLink}
              target="_self"
              rel="noopener noreferrer"
            >
              <Button size="sm" fullwidth variant="filled">
                Get to the actual version
              </Button>
            </a>
          )}
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
};
