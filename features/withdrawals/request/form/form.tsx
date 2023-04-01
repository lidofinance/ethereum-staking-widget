import { useCallback, useEffect, useState } from 'react';
import {
  Input,
  Button,
  SelectIcon,
  Option,
  DataTableRow,
} from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot';
import { TOKENS } from '@lido-sdk/constants';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { useInputValidate, useTxCostInUsd } from 'shared/hooks';
import {
  useSplitRequest,
  useWithdrawalsConstants,
  useWithdrawalRequest,
} from 'features/withdrawals/hooks';
import { iconsMap } from 'features/withdrawals/providers/withdrawals-provider/provider';
import { useRequestTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';

import { Options } from '../options';
import { RequestsInfo } from '../requestsInfo';

import { FormButton } from './form-button';
import { InputGroupStyled } from './styles';
import { maxNumberValidation } from 'utils/maxNumberValidation';
import { FormatToken } from 'shared/formatters/format-token';

// TODO move to shared
import { useApproveGasLimit } from 'features/wrap/features/wrap-form/hooks';
import { InputLocked } from 'features/wrap/components';

export const Form = () => {
  const [inputValue, setInputValue] = useState('');
  const {
    isApprovalFlowLoading,
    isApprovalFlow,
    isTokenLocked,
    request,
    setToken,
    token,
    isTxPending,
    allowance,
    tokenBalance,
    tokenLabel,
  } = useWithdrawalRequest({ value: inputValue });
  const { minAmount } = useWithdrawalsConstants();
  const { active } = useWeb3();
  useEffect(() => {
    setInputValue('');
  }, [token]);

  const { error } = useInputValidate({
    value: inputValue,
    inputName: `${tokenLabel} amount`,
    limit: tokenBalance,
    minimum: minAmount,
    active,
  });

  const { requests, requestsCount } = useSplitRequest(inputValue);

  const approveTxCostInUsd = useTxCostInUsd(useApproveGasLimit());

  const requestPriceInUsd = useRequestTxPrice({
    token,
    isApprovalFlow: isApprovalFlow,
    requestCount: requests?.length,
  });

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      request(requests);
    },
    [request, requests],
  );

  const rightDecorator = (
    <>
      <Button
        size="xxs"
        variant="translucent"
        onClick={() =>
          setInputValue(formatEther(tokenBalance || BigNumber.from(0)))
        }
      >
        MAX
      </Button>
      {isTokenLocked ? <InputLocked /> : undefined}
    </>
  );

  const showError = active && !!error;

  return (
    <form method="post" onSubmit={onSubmit}>
      <InputGroupStyled fullwidth error={showError && error}>
        <SelectIcon
          icon={iconsMap[token]}
          value={token}
          onChange={setToken}
          error={showError}
        >
          <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
            Lido (stETH)
          </Option>
          <Option leftDecorator={iconsMap[TOKENS.WSTETH]} value={TOKENS.WSTETH}>
            Lido (wstETH)
          </Option>
        </SelectIcon>
        <Input
          fullwidth
          placeholder="0"
          rightDecorator={rightDecorator}
          label={`${tokenLabel} amount`}
          value={inputValue}
          onChange={(event) =>
            setInputValue(maxNumberValidation(event?.currentTarget.value))
          }
          error={showError}
        />
      </InputGroupStyled>

      <RequestsInfo requests={requests} requestsCount={requestsCount} />
      <Options inputValue={inputValue} />
      <FormButton
        isLocked={isTokenLocked}
        pending={isTxPending}
        disabled={!!error || !inputValue}
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
    </form>
  );
};
