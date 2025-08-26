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
import { useVersionStatus } from './use-version-status';
import { useAddressValidation } from 'providers/address-validation-provider';

const LIDO_TWITTER_LINK = 'https://twitter.com/LidoFinance';

type WarningContentOptions = {
  isUpdateAvailable: boolean;
  isVersionUnsafe: boolean;
  isNotVerifiable: boolean;
  isIpfs: boolean;
  isNotValidAddress: boolean;
};

const warningContent = ({
  isUpdateAvailable,
  isVersionUnsafe,
  isNotVerifiable,
  isIpfs,
  isNotValidAddress,
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
    case isVersionUnsafe && !isUpdateAvailable:
      return {
        content: (
          <WarningText>
            The Lido staking widget is currently down. A fix is in progress
          </WarningText>
        ),
        canClose: false,
        showTwitterLink: true,
      };
    case isVersionUnsafe && isUpdateAvailable:
      return {
        content: (
          <WarningText>
            This version of Lido staking widget has issues that could impact
            your experience.
          </WarningText>
        ),
        canClose: false,
        showTwitterLink: false,
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
    case isNotValidAddress:
      return {
        content: (
          <WarningBlock>
            Sorry, you don’t have access to our services right now.
          </WarningBlock>
        ),
        canClose: false,
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
  } = useVersionStatus();
  const { isNotValidAddress, setIsNotValidAddress } = useAddressValidation();
  const { content, canClose, showTwitterLink } = warningContent({
    isUpdateAvailable,
    isVersionUnsafe,
    isNotVerifiable,
    isIpfs: config.ipfsMode,
    isNotValidAddress,
  });

  const showModal =
    (!!content && !(canClose && areConditionsAccepted)) || isNotValidAddress;

  return (
    <NoSsrWrapper>
      <Modal
        open={showModal}
        onClose={
          isNotValidAddress ? () => setIsNotValidAddress(false) : undefined
        }
      >
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
              href={data.remoteCidLink ?? window.location.href}
              onClick={
                config.ipfsMode
                  ? undefined
                  : (e) => {
                      e.preventDefault();
                      window.location.reload();
                    }
              }
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
