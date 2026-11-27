import { useWatch } from 'react-hook-form';
import { DataListRow, Typography } from '@lidofinance/lido-app-ui';

import { FormatPrice, FormatToken } from 'shared/formatters';

import { Loader, tokenSymbol, useAmountField } from '../../../utils';
import { useStakeForm, useStakeFormContext } from '../stake-form-context';
import { TokenInSelect } from '../token-in-select';
import { TokenOutSelect } from '../token-out-select';

import { WrapperCard, FullWidthInput, DataListStyled } from './styles';

export const StakeInput = () => {
  const { control, setValue } = useStakeFormContext();
  // every stake token has 18 decimals
  const amountField = useAmountField({ control, name: 'amount' });
  // the route decides the max (balance, stake limit, pool capacity)
  const { maxAmount, isContextLoading, amountInUsd } = useStakeForm();
  const tokenIn = useWatch({ control, name: 'tokenIn' });

  // nothing while disconnected: there is no route context to show
  const maxLabel = isContextLoading ? (
    <Loader isLoading width={96} />
  ) : maxAmount !== undefined ? (
    <FormatToken amount={maxAmount} symbol={tokenSymbol(tokenIn.token)} />
  ) : undefined;

  // no amount (empty or 0) fails with no text, so it shows nothing here
  const hasError = !!amountField.error;
  return (
    <WrapperCard>
      <FullWidthInput
        label="Stake amount"
        secondaryValue={
          hasError ? (
            <Typography as="span" variant="inherit" color="error">
              {amountField.error}
            </Typography>
          ) : (
            <FormatPrice amount={amountInUsd} />
          )
        }
        balance={maxLabel}
        showMaxButton
        maxDisabled={maxAmount === undefined}
        onMaxClick={() => {
          if (maxAmount === undefined) return;
          setValue('amount', maxAmount, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        placeholder="0"
        tokenSelector={<TokenInSelect />}
        {...amountField}
        error={hasError}
      />
      <DataListStyled>
        <DataListRow label="Receive" info="TODO" value={<TokenOutSelect />} />
      </DataListStyled>
    </WrapperCard>
  );
};
