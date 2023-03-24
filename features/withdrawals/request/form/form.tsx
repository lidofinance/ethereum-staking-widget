import { useCallback, useMemo, useState } from 'react';
import { Input, Button, SelectIcon, Option } from '@lidofinance/lido-ui';
import { TOKENS, CHAINS } from '@lido-sdk/constants';
import {
  useWSTETHContractWeb3,
  useSTETHBalance,
  useWSTETHBalance,
  useSDK,
} from '@lido-sdk/react';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { useERC20PermitSignature, useInputValidate } from 'shared/hooks';
import {
  useWithdrawals,
  useSplitRequest,
  useRequestTxModal,
  useWithdrawalsPermitWstETH,
  useWithdrawalsPermitStETH,
  useWithdrawalsConstants,
} from 'features/withdrawals/hooks';
import { iconsMap } from 'features/withdrawals/providers/withdrawals-provider/provider';
import {
  getWithdrawalRequestNFTAddress,
  useSTETHContractWeb3,
} from 'customSdk/contracts';
import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import { getErrorMessage } from 'utils';

import { Options } from '../options';
import { RequestsInfo } from '../requestsInfo';

import { FormButton } from './form-button';
import { InputGroupStyled } from './styles';

export const Form = () => {
  const [inputValue, setInputValue] = useState('');
  const [isPending, setIsPending] = useState(false);

  const { selectedToken, setSelectedToken, isBunkerMode } = useWithdrawals();
  const permitRequestWithdrawalWstETH = useWithdrawalsPermitWstETH();
  const permitRequestWithdrawalStETH = useWithdrawalsPermitStETH();
  const { minAmount } = useWithdrawalsConstants();
  const {
    formRef,
    setTxStage,
    openTxModal,
    setTxModalFailedText,
    setTxHash,
    setCallback,
  } = useRequestTxModal();

  const { chainId } = useSDK();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const stethContractWeb3 = useSTETHContractWeb3();

  const balanceBySelectedToken = useMemo(() => {
    return selectedToken === TOKENS.WSTETH
      ? wstethBalance.data
      : stethBalance.data;
  }, [selectedToken, stethBalance.data, wstethBalance.data]);
  const { error, value } = useInputValidate({
    value: inputValue,
    inputName: `${selectedToken} Amount`,
    limit: balanceBySelectedToken,
    minimum: minAmount,
  });
  const { requests } = useSplitRequest(value);

  const { gatherPermitSignature: gatherPermilSignature } =
    useERC20PermitSignature({
      token: selectedToken,
      value: inputValue,
      tokenProvider:
        selectedToken === TOKENS.WSTETH
          ? wstethContractWeb3
          : stethContractWeb3,
      spender: getWithdrawalRequestNFTAddress(chainId as CHAINS),
    });

  const maxButton = (
    <Button
      size="xxs"
      variant="translucent"
      onClick={() =>
        setInputValue(formatEther(balanceBySelectedToken || BigNumber.from(0)))
      }
    >
      MAX
    </Button>
  );

  const request = useCallback(async () => {
    setIsPending(true);

    setTxStage(TX_STAGE.PERMIT);
    openTxModal();
    try {
      const signature = await gatherPermilSignature();
      selectedToken === TOKENS.WSTETH
        ? permitRequestWithdrawalWstETH({ signature, requests })
        : permitRequestWithdrawalStETH({ signature, requests });

      setIsPending(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setTxModalFailedText(errorMessage);
      setTxStage(TX_STAGE.FAIL);
      setTxHash(undefined);
      openTxModal();
      setIsPending(false);
    }
  }, [
    gatherPermilSignature,
    openTxModal,
    permitRequestWithdrawalStETH,
    permitRequestWithdrawalWstETH,
    requests,
    selectedToken,
    setTxHash,
    setTxModalFailedText,
    setTxStage,
  ]);

  const openBunkerModal = useCallback(() => {
    setTxStage(TX_STAGE.BUNKER);
    setCallback(() => request);
    openTxModal();
  }, [openTxModal, request, setCallback, setTxStage]);

  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (isBunkerMode) openBunkerModal();
      else request();
    },
    [isBunkerMode, openBunkerModal, request],
  );

  const tokenPlaceholder = useMemo(() => {
    return selectedToken === TOKENS.WSTETH ? 'wstETH' : 'stETH';
  }, [selectedToken]);

  return (
    <form method="post" onSubmit={submit} ref={formRef}>
      <InputGroupStyled fullwidth error={error}>
        <SelectIcon
          icon={iconsMap[selectedToken]}
          value={selectedToken}
          onChange={setSelectedToken}
          error={!!error}
        >
          <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
            Lido (STETH)
          </Option>
          <Option leftDecorator={iconsMap[TOKENS.WSTETH]} value={TOKENS.WSTETH}>
            Lido (WSTETH)
          </Option>
        </SelectIcon>
        <Input
          fullwidth
          placeholder="0"
          rightDecorator={maxButton}
          label={`${tokenPlaceholder} Amount`}
          value={inputValue}
          onChange={(event) => setInputValue(event?.currentTarget.value)}
          error={!!error}
        />
      </InputGroupStyled>
      <RequestsInfo requests={requests} />
      <Options inputValue={value} />
      <FormButton pending={isPending} disabled={!!error || !inputValue} />
    </form>
  );
};
