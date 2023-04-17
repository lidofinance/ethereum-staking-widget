import { useCallback } from 'react';
import {
  Input,
  Button,
  SelectIcon,
  Option,
  DataTableRow,
} from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { useTxCostInUsd } from 'shared/hooks';
import {
  useSplitRequest,
  useWithdrawalRequest,
  useRequestForm,
} from 'features/withdrawals/hooks';
import { iconsMap } from 'features/withdrawals/providers/withdrawals-provider/provider';
import { useRequestTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';

import { Options } from '../options';
import { RequestsInfo } from '../requestsInfo';

import { FormButton } from './form-button';
import { InputGroupStyled } from './styles';
import { FormatToken } from 'shared/formatters/format-token';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';

// TODO move to shared
import { useApproveGasLimit } from 'features/wrap/features/wrap-form/hooks';
import { InputLocked } from 'features/wrap/components';

export const Form = () => {
  const {
    inputValue,
    setInputValue,
    showError,
    token,
    tokenContract,
    tokenLabel,
    handleInputChange,
    handleResetInput,
    handleChangeToken,
    error,
    tvlMessage,
    stakeButton,
    tokenBalance,
  } = useRequestForm();

  const {
    isApprovalFlowLoading,
    isApprovalFlow,
    isTokenLocked,
    request,
    isTxPending,
    allowance,
  } = useWithdrawalRequest({
    value: inputValue,
    reset: handleResetInput,
    tokenLabel,
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

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      request(requests);
    },
    [request, requests],
  );

  const rightDecorator = tvlMessage ? (
    stakeButton
  ) : (
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

  return (
    <form method="post" onSubmit={onSubmit}>
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
        <Input
          fullwidth
          placeholder="0"
          rightDecorator={rightDecorator}
          label={`${tokenLabel} amount`}
          value={inputValue}
          onChange={handleInputChange}
          error={showError}
        />
      </InputGroupStyled>

      <RequestsInfo requestCount={requestCount} />
      <Options />
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
      {tokenLabel === 'stETH' ? (
        <DataTableRow title="Exchange rate">1 stETH = 1 ETH</DataTableRow>
      ) : (
        <DataTableRowStethByWsteth />
      )}
    </form>
  );
};
