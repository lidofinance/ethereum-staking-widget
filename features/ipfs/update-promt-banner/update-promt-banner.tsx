import { Button, Modal } from '@lidofinance/lido-ui';

import { dynamics } from 'config';

import { WarningIcon, Wrapper, WarningText, WarningSubText } from './styles';
import { useVersionCheck } from './use-version-check';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

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
    case isIpfs && isNotVerifiable:
      return {
        content: (
          <WarningText>
            We could not verify security of this IPFS version
          </WarningText>
        ),
        canClose: true,
      };
    case isIpfs && isVersionUnsafe && isUpdateAvailable:
      return {
        content: (
          <WarningText>
            This IPFS version has issues that could impact your experience
          </WarningText>
        ),
        canClose: false,
      };
    case isVersionUnsafe && !isUpdateAvailable:
      return {
        content: (
          <WarningText>
            The staking widget is currently down. Resolving is in progress
          </WarningText>
        ),
        canClose: false,
        showTwitterLink: true,
      };
    case isIpfs && isUpdateAvailable:
      return {
        content: (
          <WarningText>
            This is not the most recent version of IPFS Widget
            <br />
            <WarningSubText>
              Note that you may not find new features or functionality in this
              version
            </WarningSubText>
          </WarningText>
        ),
        canClose: true,
      };
    default:
      return { content: null };
  }
};

export const UpgradePromtBanner = () => {
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
    isIpfs: dynamics.ipfsMode,
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
                Follow X for more info
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
                Get to the actual version
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
              Accept possible issues and proceed
            </Button>
          )}
        </Wrapper>
      </Modal>
    </NoSsrWrapper>
  );
};
