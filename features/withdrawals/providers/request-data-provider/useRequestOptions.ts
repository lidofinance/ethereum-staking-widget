import { useCallback, useMemo, useState } from 'react';

const REQUEST_OPTIONS: RequestOption[] = [
  {
    type: 'lido',
    selected: true,
  },
  // {
  //   type: 'oneinch',
  //   selected: false,
  //   stethUrl: 'https://app.1inch.io/#/1/simple/swap/stETH/ETH',
  //   wstethUrl: 'https://app.1inch.io/#/1/simple/swap/wstETH/ETH',
  //   name: '1inch',
  // },
];

export type RequestTypes = 'lido' | 'oneinch';
export type RequestOption = {
  type: RequestTypes;
  selected: boolean;
  stethUrl?: string;
  wstethUrl?: string;
  name?: string;
};

export const useRequestOptions = () => {
  const [options, setOptions] = useState(REQUEST_OPTIONS);

  const onChangeRequestOptions = useCallback(
    (type: RequestTypes) => {
      const newOptions = options.map((option) => {
        if (option.type !== type) return { ...option, selected: false };
        return { ...option, selected: true };
      });

      setOptions(newOptions);
    },
    [options],
  );

  const isLidoRequest = useMemo(
    () => options.find((option) => option.type === 'lido')?.selected,
    [options],
  );
  const currentRequestType = useMemo(
    () => options.find((option) => option.selected),
    [options],
  );

  return {
    onChangeRequestOptions,
    requestOptions: options,
    isLidoRequest,
    currentRequestType,
  };
};
