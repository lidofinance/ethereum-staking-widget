import { Button, Modal } from '@lidofinance/lido-ui';

import { config } from 'config';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

import {
  WarningIcon,
  Wrapper,
  WarningText,
  WarningSubText,
  WarningBlock,
  WarningTitle,
} from './styles';
import { useVersionCheck } from './use-version-check';

const LIDO_TWITTER_LINK = 'https://twitter.com/LidoFinance';

type WarningContentOptions = {
  isUpdateAvailable: boolean;
  isVersionUnsafe: boolean;
  isNotVerifiable: boolean;
  isIpfs: boolean;
};

const warningContent = ({
  isUpdateAvailable,
  isVersionUnsafe,
  isNotVerifiable,
  isIpfs,
}: WarningContentOptions) => {
  switch (true) {
    // not veryfiable, only for IPFS
    case isIpfs && isNotVerifiable:
      return {
        content: (
          <WarningBlock>
            <WarningTitle>This IPFS version can’t be verified</WarningTitle>
            <WarningSubText>Please try again later</WarningSubText>
          </WarningBlock>
        ),
        canClose: false,
      };
    //  IPFS ver is less than leastSafeVersion, but new version is available
    case isIpfs && isVersionUnsafe && isUpdateAvailable:
      return {
        content: (
          <WarningText>
            This IPFS version has issues that could impact your experience
          </WarningText>
        ),
        canClose: false,
      };
    // we can show this banner on both infra and IPFS
    case isVersionUnsafe && (!isIpfs || !isUpdateAvailable):
      return {
        content: (
          <WarningText>
            The Lido staking widget is currently down. A fix is in progress
          </WarningText>
        ),
        canClose: false,
        showTwitterLink: true,
      };
    // outdated IPFS
    case isIpfs && isUpdateAvailable:
      return {
        content: (
          <WarningBlock>
            <WarningTitle>
              This is not the most up to date version of the IPFS widget
            </WarningTitle>
            <WarningSubText>
              Please note that the functionality of this version may be lacking
            </WarningSubText>
          </WarningBlock>
        ),
        canClose: true,
      };
    default:
      return { content: null };
  }
};

export const SecurityStatusBanner = () => {
  const {
    areConditionsAccepted,
    setConditionsAccepted,
    isUpdateAvailable,
    isVersionUnsafe,
    isNotVerifiable,
    data,
  } = useVersionCheck();

  const { content, canClose, showTwitterLink } = warningContent({
    isUpdateAvailable,
    isVersionUnsafe,
    isNotVerifiable,
    isIpfs: config.ipfsMode,
  });

  const showModal = !!content && !(canClose && areConditionsAccepted);

  return (
    <NoSsrWrapper>
      <Modal open={showModal}>
        <Wrapper>
          <WarningIcon />
          {content}
          {showTwitterLink && (
            <a
              href={LIDO_TWITTER_LINK}
              target="_self"
              rel="noopener noreferrer"
            >
              <Button size="sm" fullwidth variant="filled">
                Check X for more info
              </Button>
            </a>
          )}
          {isUpdateAvailable && (
            <a
              href={data.remoteCidLink}
              target="_self"
              rel="noopener noreferrer"
            >
              <Button size="sm" fullwidth variant="filled">
                Click to update to the newest version
              </Button>
            </a>
          )}
          {canClose && (
            <Button
              size="sm"
              fullwidth
              color="warning"
              variant="outlined"
              onClick={() => setConditionsAccepted(true)}
            >
              Accept the possible issues and proceed
            </Button>
          )}
        </Wrapper>
      </Modal>
    </NoSsrWrapper>
  );
};
