import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
import { Button, ToastSuccess, Block, Input } from '@lidofinance/lido-ui';

import { useUserConfig } from 'config/user-config';
import { CHAINS } from 'consts/chains';
import { LinkArrow } from 'shared/components/link-arrow/link-arrow';
import { useContractAddress } from 'shared/hooks/use-contract-address';
import { RPCErrorType, checkRpcUrl } from 'utils/check-rpc-url';

import {
  Actions,
  DescriptionText,
  DescriptionTitle,
  SettingsFormWrap,
} from './styles';
import { useDappStatus } from 'modules/web3';

type FormValues = {
  rpcUrl: string;
};

export const SettingsForm = () => {
  const { savedUserConfig, setSavedUserConfig } = useUserConfig();
  const { chainId } = useDappStatus();

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      rpcUrl: savedUserConfig.rpcUrls[chainId as unknown as CHAINS],
    },
  });

  const { data: stethAddress } = useContractAddress(
    'lido' as LIDO_CONTRACT_NAMES,
  );

  const {
    formState,
    setValue,
    getValues,
    formState: { errors },
    clearErrors,
  } = formMethods;

  const saveSettings = useCallback(
    (formValues: FormValues) => {
      setSavedUserConfig({
        rpcUrls: {
          [chainId]: formValues.rpcUrl,
        },
      });
    },
    [chainId, setSavedUserConfig],
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
      const rpcCheckResult = await checkRpcUrl(rpcUrl, chainId, stethAddress);
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
    [chainId, stethAddress],
  );

  const handleReset = useCallback(() => {
    setValue('rpcUrl', '');
    saveSettings(getValues());
    clearErrors();
    ToastSuccess('Settings have been reset');
  }, [clearErrors, setValue, saveSettings, getValues]);

  return (
    <SettingsFormWrap>
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
