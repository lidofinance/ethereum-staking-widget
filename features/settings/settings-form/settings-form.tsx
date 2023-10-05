import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { useSDK } from '@lido-sdk/react';
import { Button, ToastSuccess, Block, Input } from '@lidofinance/lido-ui';

import { useCustomConfig } from 'providers/custom-config';
import { RPCErrorType, checkRpcUrl } from 'utils/check-rpc-url';

import { Actions, DescriptionText, DescriptionTitle } from './styles';

type FormValues = {
  rpcUrl: string;
};

export const SettingsForm = () => {
  const { savedCustomConfig, setSavedCustomConfig } = useCustomConfig();
  const { chainId } = useSDK();

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      rpcUrl: savedCustomConfig.rpcUrls[chainId] || '',
    },
  });

  const {
    formState,
    setValue,
    getValues,
    formState: { errors },
  } = formMethods;

  const saveSettings = useCallback(
    (formValues: FormValues) => {
      setSavedCustomConfig({
        rpcUrls: {
          [chainId]: formValues.rpcUrl,
        },
      });
    },
    [chainId, setSavedCustomConfig],
  );

  const handleSubmit = useCallback(
    (formValues: FormValues) => {
      saveSettings(formValues);
      ToastSuccess('Settings have been saved');
    },
    [saveSettings],
  );

  const validateRpcUrl = useCallback(
    async (rpcUrl: string) => {
      if (!rpcUrl) return true;
      const rpcCheckResult = await checkRpcUrl(rpcUrl, chainId);
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

  const handleReset = useCallback(() => {
    setValue('rpcUrl', '');
    saveSettings(getValues());
    ToastSuccess('Settings have been reset');
  }, [setValue, saveSettings, getValues]);

  return (
    <>
      <Block>
        <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Input
            fullwidth
            label="RPC URL"
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
            Ethereum nodes:{' '}
            <a
              target="_blank"
              href="https://ethereumnodes.com/"
              rel="noreferrer"
            >
              ethereumnodes.com
            </a>
          </p>
          <p>
            The settings are being saved in your browser&apos;s
            local&nbsp;storage.
          </p>
        </DescriptionText>
      </Block>
    </>
  );
};
