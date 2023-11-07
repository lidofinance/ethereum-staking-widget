import { useCallback } from 'react';
import { useLidoSWR, useLocalStorage, useSDK } from '@lido-sdk/react';

import { useRpcUrl } from 'config/rpc';
import { SETTINGS_PATH } from 'config/urls';
import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';
import { useRouterPath } from 'shared/hooks/use-router-path';

import { Check, Close } from '@lidofinance/lido-ui';
import {
  Wrap,
  RpcStatusBox,
  Button,
  InfoLink,
  LinkArrow,
  Text,
} from './styles';

import { checkRpcUrl } from 'utils/check-rpc-url';
import { STORAGE_IPFS_INFO_DISMISS } from 'config/storage';

const IPFS_INFO_URL = 'https://docs.ipfs.tech/concepts/what-is-ipfs/';

export const IPFSInfoBox = () => {
  const { chainId } = useSDK();
  const push = usePrefixedPush();
  const [isDismissed, setDismissStorage] = useLocalStorage(
    STORAGE_IPFS_INFO_DISMISS,
    false,
  );

  const rpcUrl = useRpcUrl();
  const { data: rpcCheckResult, initialLoading: isLoading } = useLidoSWR(
    `rpc-url-check-${rpcUrl}-${chainId}`,
    async () => {
      return await checkRpcUrl(rpcUrl, chainId);
    },
  );

  const handleClickDismiss = useCallback(() => {
    setDismissStorage(true);
  }, [setDismissStorage]);

  const handleClickSettings = useCallback(() => {
    void push(SETTINGS_PATH);
    setDismissStorage(true);
  }, [push, setDismissStorage]);

  const pathname = useRouterPath();
  const isSettingsPage = pathname === SETTINGS_PATH;

  if ((isDismissed && rpcCheckResult === true) || isLoading || isSettingsPage) {
    return null;
  }

  return (
    <Wrap>
      <Text weight={700} size="xs" color="accentContrast">
        You are currently using the IPFS widget&apos;s version.
      </Text>
      <InfoLink href={IPFS_INFO_URL}>
        IPFS <LinkArrow />
      </InfoLink>
      {rpcCheckResult === true && (
        <>
          <RpcStatusBox status="success">
            <Text
              weight={700}
              size="xxs"
              color="success"
              style={{ paddingRight: 10 }}
            >
              The pre-installed RPC node URL is now functioning correctly.
            </Text>
            <Check width={24} height={24} />
          </RpcStatusBox>
          <Text weight={400} size="xxs" color="accentContrast">
            However, you can visit the settings if you wish to customize your
            own RPC node URL.
          </Text>
          <Button size="xs" onClick={handleClickDismiss}>
            Dismiss
          </Button>
        </>
      )}
      {rpcCheckResult !== true && (
        <>
          <RpcStatusBox status="error">
            <Text
              weight={700}
              size="xxs"
              color="error"
              style={{ paddingRight: 10 }}
            >
              The pre-installed RPC node URL is not now functioning.
            </Text>
            <Close width={20} height={20} />
          </RpcStatusBox>
          <Text weight={400} size="xxs" color="accentContrast">
            You should visit the settings page and specify your own RPC node
            URL.
          </Text>
          <Button size="xs" onClick={handleClickSettings}>
            Open settings page
          </Button>
        </>
      )}
    </Wrap>
  );
};
