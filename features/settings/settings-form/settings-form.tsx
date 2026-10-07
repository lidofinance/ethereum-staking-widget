import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button, ToastSuccess, Block, Input } from '@lidofinance/lido-ui';

import type { CHAINS } from 'consts/chains';
import { useUserConfig } from 'config/user-config';
import { wagmiChainMap } from 'modules/web3/consts/chains';
import { LinkArrow } from 'shared/components/link-arrow/link-arrow';
import {
  RPCErrorType,
  checkRpcUrl,
  getRpcCheckAddress,
} from 'utils/check-rpc-url';

import {
  Actions,
  DescriptionText,
  DescriptionTitle,
  SettingsFormWrap,
} from './styles';

type FormValues = {
  rpcUrl: string;
};

// One form per chain: every supported chain keeps its own custom RPC, and a
// user on an L2 can replace the L2 endpoint the wrap form actually uses
const RpcUrlForm = ({ chainId }: { chainId: CHAINS }) => {
  const { savedUserConfig, setRpcUrl } = useUserConfig();
  const chainName = wagmiChainMap[chainId]?.name ?? `chain ${chainId}`;

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { rpcUrl: savedUserConfig.rpcUrls[chainId] ?? '' },
  });

  const {
    formState,
    setValue,
    formState: { errors },
    clearErrors,
  } = formMethods;

  const handleSubmit = useCallback(
    ({ rpcUrl }: FormValues) => {
      setRpcUrl(chainId, rpcUrl);
      ToastSuccess(`${chainName} RPC has been saved`);
    },
    [chainId, chainName, setRpcUrl],
  );

  const handleReset = useCallback(() => {
    setValue('rpcUrl', '');
    clearErrors();
    setRpcUrl(chainId);
    ToastSuccess(`${chainName} RPC has been reset`);
  }, [chainId, chainName, clearErrors, setRpcUrl, setValue]);

  const validateRpcUrl = useCallback(
    async (rpcUrl: string) => {
      if (!rpcUrl) return true;
      const rpcCheckResult = await checkRpcUrl(
        rpcUrl,
        chainId,
        getRpcCheckAddress(chainId),
      );
      switch (rpcCheckResult) {
        case true:
          return true;
        case RPCErrorType.URL_IS_NOT_VALID:
          return 'Given string is not valid url';
        case RPCErrorType.URL_IS_NOT_WORKING:
          return 'Given url is not working';
        case RPCErrorType.NETWORK_DOES_NOT_MATCH:
          return 'Url is working, but network does not match';
      }
    },
    [chainId],
  );

  return (
    <Block>
      <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Input
          fullwidth
          label={`${chainName} RPC URL`}
          error={errors?.rpcUrl?.message}
          {...formMethods.register('rpcUrl', {
            required: true,
            validate: validateRpcUrl,
          })}
        />
        <Actions>
          <Button fullwidth variant="translucent" onClick={handleReset}>
            Reset to defaults
          </Button>
          <Button
            type="submit"
            fullwidth
            color="primary"
            loading={formState.isValidating}
            disabled={!formState.isValid || formState.isValidating}
          >
            Save
          </Button>
        </Actions>
      </form>
    </Block>
  );
};

export const SettingsForm = () => {
  const { supportedChainIds } = useUserConfig();

  return (
    <SettingsFormWrap>
      {supportedChainIds.map((chainId) => (
        <RpcUrlForm key={chainId} chainId={chainId} />
      ))}

      <br />

      <Block>
        <DescriptionText>
          <DescriptionTitle>What are these settings for?</DescriptionTitle>
          <p>
            This website relies on a JSON RPC connection. For more reliable
            operation, consider specifying your own. You can get yours by
            visiting the link below.
          </p>
          <p>
            <LinkArrow
              target="_blank"
              href="https://ethereumnodes.com/"
              rel="noreferrer"
            >
              ethereumnodes.com
            </LinkArrow>
          </p>
          <p>
            The settings are being saved in your browser&apos;s
            local&nbsp;storage.
          </p>
        </DescriptionText>
      </Block>
    </SettingsFormWrap>
  );
};
