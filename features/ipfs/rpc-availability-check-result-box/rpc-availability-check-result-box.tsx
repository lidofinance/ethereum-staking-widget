import { useCallback } from 'react';
import { Check, Close } from '@lidofinance/lido-ui';

import { SETTINGS_PATH } from 'config/urls';
import { useIPFSInfoBoxStatuses } from 'providers/ipfs-info-box-statuses';
import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';
import { LinkArrow } from 'shared/components/link-arrow/link-arrow';

import { Wrap, RpcStatusBox, Button, Text } from './styles';

export const IPFS_INFO_URL = 'https://docs.lido.fi/ipfs/about';

export const RPCAvailabilityCheckResultBox = () => {
  const { isRPCAvailable, handleClickDismiss } = useIPFSInfoBoxStatuses();

  const push = usePrefixedPush();

  const handleClickSettings = useCallback(() => {
    void push(SETTINGS_PATH);
    handleClickDismiss();
  }, [push, handleClickDismiss]);

  return (
    <Wrap>
      <Text weight={700} size="xs" color="accentContrast">
        You are currently using the IPFS widget version.
      </Text>
      <LinkArrow href={IPFS_INFO_URL}>What is IPFS</LinkArrow>
      {isRPCAvailable && (
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
      {!isRPCAvailable && (
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
