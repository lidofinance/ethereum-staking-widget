import { FC } from 'react';
import { useRequestData } from 'features/withdrawals/hooks';

import { Lido, Oneinch } from './common';
import { OptionsBlockStyled } from './styles';

const REQUEST_OPTIONS = {
  lido: Lido,
  oneinch: Oneinch,
};

type OptionsProps = {
  inputValue: string;
};

export const Options: FC<OptionsProps> = ({ inputValue }) => {
  const { requestOptions, onChangeRequestOptions } = useRequestData();

  return (
    <OptionsBlockStyled>
      {/* // TODO uncomment after add integration */}
      {/* <OptionsTitleStyled>Choose and receive::</OptionsTitleStyled> */}
      {requestOptions.map((option, index) => {
        const Component = REQUEST_OPTIONS[option.type];

        return (
          <Component
            key={index}
            inputValue={inputValue}
            selected={option.selected}
            onClick={onChangeRequestOptions}
          />
        );
      })}
    </OptionsBlockStyled>
  );
};
