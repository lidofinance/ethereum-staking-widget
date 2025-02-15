import { forwardRef } from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import {
  Checkbox,
  CheckboxProps,
  External,
  Tooltip,
} from '@lidofinance/lido-ui';
import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';

import { FormatToken } from 'shared/formatters';
import { useDappStatus, useContractAddress } from 'modules/web3';
import { getNFTUrl } from 'utils';

import { useClaimFormData, ClaimFormInputType } from '../../claim-form-context';
import { RequestStatus } from './request-item-status';
import { RequestStyled, LinkStyled } from './styles';

type RequestItemProps = {
  token_id: string;
  name: `requests.${number}.checked`;
  index: number;
} & CheckboxProps;

export const RequestItem = forwardRef<HTMLInputElement, RequestItemProps>(
  ({ token_id, name, disabled, index, ...props }, ref) => {
    const { chainId } = useDappStatus();
    const { isSubmitting } = useFormState();
    const { canSelectMore, maxSelectedCountReason } = useClaimFormData();
    const { checked, status } = useWatch<
      ClaimFormInputType,
      `requests.${number}`
    >({
      name: `requests.${index}`,
    });

    const { data: withdrawalQueueAddress } = useContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );

    const isDisabled =
      disabled ||
      !status.isFinalized ||
      (!canSelectMore && !checked) ||
      isSubmitting;

    const isClaimable = 'claimableEth' in status;

    const amountValue = isClaimable
      ? status.claimableEth
      : status.amountOfStETH;
    const symbol = isClaimable ? 'ETH' : 'stETH';

    const showDisabledReasonTooltip =
      maxSelectedCountReason &&
      !canSelectMore &&
      status.isFinalized &&
      !checked;

    const label = (
      <FormatToken
        data-testid="requestAmount"
        amount={amountValue}
        symbol={symbol}
        // prevents tip overlap
        showAmountTip={!showDisabledReasonTooltip}
      />
    );

    const requestBody = (
      <RequestStyled data-testid={'requestItem'} $disabled={isDisabled}>
        <Checkbox
          {...props}
          data-testid="requestCheckbox"
          label={label}
          disabled={isDisabled}
          name={name}
          ref={ref}
        />
        <RequestStatus
          status={status.isFinalized ? 'ready' : 'pending'}
          finalizationAt={status.finalizationAt}
        />
        <LinkStyled
          data-testid="requestNftLink"
          href={getNFTUrl(token_id, withdrawalQueueAddress, chainId)}
        >
          <External />
        </LinkStyled>
      </RequestStyled>
    );

    return showDisabledReasonTooltip ? (
      <Tooltip title={maxSelectedCountReason} placement="top">
        {requestBody}
      </Tooltip>
    ) : (
      requestBody
    );
  },
);
