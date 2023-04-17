import { useCallback, useState } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useTxCostInUsd } from 'shared/hooks';
import {
  useSplitRequest,
  useWithdrawalsConstants,
  useWithdrawalRequest,
  useInputTvlValidate,
} from 'features/withdrawals/hooks';
import { useRequestTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { useValidateUnstakeValue } from 'features/withdrawals/hooks/useValidateUnstakeValue';
import { useToken } from 'features/withdrawals/request/form/useToken';
import { useCurrencyInput } from 'shared/forms/hooks/useCurrencyInput';

import { Options } from '../options';
import { FormatToken } from 'shared/formatters/format-token';
import { RequestsInfo } from '../requestsInfo';
import { InputNumber } from 'shared/forms/components/input-number';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { InputDecoratorLocked } from 'shared/forms/components/input-decorator-locked';
import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import { FormButton } from './form-button';
import { InputGroupStyled } from './styles';
import { SelectIcon, Option, DataTableRow } from '@lidofinance/lido-ui';

import { TOKENS } from '@lido-sdk/constants';
import { iconsMap } from 'features/withdrawals/providers/withdrawals-provider/provider';

// TODO move to shared
import { useApproveGasLimit } from 'features/wrap/features/wrap-form/hooks';

export const Form = () => {
  const [inputValue, setInputValue] = useState('');
  const { active } = useWeb3();
  const { minAmount } = useWithdrawalsConstants();
  const { tokenBalance, tokenLabel, tokenContract, setToken, token } =
    useToken();
  const { tvlDiff, tvlMessage } = useInputTvlValidate(inputValue);

  const {
    isApprovalFlowLoading,
    isApprovalFlow,
    isTokenLocked,
    request,
    isTxPending,
    allowance,
  } = useWithdrawalRequest({
    value: inputValue,
    tokenContract,
    token,
  });

  const { requests, requestCount } = useSplitRequest(inputValue);

  const approveTxCostInUsd = useTxCostInUsd(useApproveGasLimit());

  const requestPriceInUsd = useRequestTxPrice({
    token,
    isApprovalFlow: isApprovalFlow,
    // request.length is bounded by max value
    // while useSplitRequest.requestCount is not
    requestCount: requests.length,
  });

  const submit = useCallback(
    async (inputValue: string, resetForm: () => void) => {
      await request(requests, resetForm);
    },
    [request, requests],
  );

  const validateUnstakeValue = useValidateUnstakeValue({ minAmount });

  const {
    handleChange,
    error,
    isSubmitting,
    handleSubmit,
    reset,
    setMaxInputValue,
    isMaxDisabled,
  } = useCurrencyInput({
    inputValue,
    setInputValue,
    inputName: `${tokenLabel} amount`,
    limit: tokenBalance,
    submit,
    token,
    extraValidationFn: validateUnstakeValue,
    shouldValidate: active,
  });

  const handleChangeToken = useCallback(
    (token: TOKENS.STETH | TOKENS.WSTETH) => {
      setToken(token);
      reset();
    },
    [setToken, reset],
  );

  const showError = active && !!error && !tvlMessage;

  return (
    <form method="post" onSubmit={handleSubmit}>
      <InputGroupStyled
        fullwidth
        error={showError && error}
        success={tvlMessage}
      >
        <SelectIcon
          icon={iconsMap[token]}
          value={token}
          onChange={handleChangeToken}
          error={showError}
        >
          <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
            Lido (stETH)
          </Option>
          <Option leftDecorator={iconsMap[TOKENS.WSTETH]} value={TOKENS.WSTETH}>
            Lido (wstETH)
          </Option>
        </SelectIcon>
        <InputNumber
          fullwidth
          placeholder="0"
          rightDecorator={
            tvlMessage ? (
              <InputDecoratorTvlStake tvlDiff={tvlDiff} />
            ) : (
              <>
                <InputDecoratorMaxButton
                  onClick={setMaxInputValue}
                  disabled={isMaxDisabled}
                />
                {isTokenLocked ? <InputDecoratorLocked /> : undefined}
              </>
            )
          }
          label={`${tokenLabel} amount`}
          value={inputValue}
          onChange={handleChange}
          error={showError}
        />
      </InputGroupStyled>

      <RequestsInfo requestCount={requestCount} />
      <Options inputValue={inputValue} />
      <FormButton
        isLocked={isTokenLocked}
        pending={isTxPending || isSubmitting}
        disabled={!!error}
      />
      <DataTableRow
        help={
          isApprovalFlow ? undefined : (
            <>Lido leverages gasless token approvals via ERC-2612 permits</>
          )
        }
        title="Max unlock cost"
        loading={isApprovalFlowLoading}
      >
        {isApprovalFlow ? `$${approveTxCostInUsd?.toFixed(2)}` : 'FREE'}
      </DataTableRow>
      <DataTableRow title="Max transaction cost" loading={!requestPriceInUsd}>
        ${requestPriceInUsd?.toFixed(2)}
      </DataTableRow>
      <DataTableRow title="Allowance" loading={isApprovalFlowLoading}>
        <FormatToken amount={allowance} symbol={tokenLabel} />
      </DataTableRow>
      {tokenLabel === 'stETH' ? (
        <DataTableRow title="Exchange rate">1 stETH = 1 ETH</DataTableRow>
      ) : (
        <DataTableRowStethByWsteth />
      )}
    </form>
  );
};
