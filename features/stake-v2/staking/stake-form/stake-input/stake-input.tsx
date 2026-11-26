import { useState } from 'react';
import { useController } from 'react-hook-form';
import { formatEther, parseEther } from 'viem';
import { DataListRow } from '@lidofinance/lido-app-ui';

import { useStakeFormContext } from '../stake-form-context';
import { TokenInSelect } from '../token-in-select';
import { TokenOutSelect } from '../token-out-select';

import { WrapperCard, FullWidthInput, DataListStyled } from './styles';

// every stake token has 18 decimals
const AMOUNT_DECIMALS = 18;

const parseAmount = (text: string) => {
  if (!text) return null;
  try {
    return parseEther(text);
  } catch {
    return null;
  }
};

// TODO: move into a reusable amount control
const useAmountField = () => {
  const { control } = useStakeFormContext();
  const { field } = useController({ control, name: 'amount' });

  // the typed text, so "1." or "0.10" survive while the form holds a bigint
  const [text, setText] = useState(() =>
    field.value === null ? '' : formatEther(field.value),
  );
  // the amount changed from outside (query param, reset, max): show it
  if (parseAmount(text) !== field.value) {
    setText(field.value === null ? '' : formatEther(field.value));
  }

  return {
    ref: field.ref,
    name: field.name,
    onBlur: field.onBlur,
    value: text,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setText(event.target.value);
      field.onChange(parseAmount(event.target.value));
    },
  };
};

export const StakeInput = () => {
  const amountField = useAmountField();

  return (
    <WrapperCard>
      <FullWidthInput
        label="Stake amount"
        secondaryValue="$0"
        balance="111"
        showMaxButton
        decimals={AMOUNT_DECIMALS}
        inputMode="decimal"
        placeholder="0"
        tokenSelector={<TokenInSelect />}
        {...amountField}
      />
      <DataListStyled>
        <DataListRow label="Recieve" info="TODO" value={<TokenOutSelect />} />
      </DataListStyled>
    </WrapperCard>
  );
};
