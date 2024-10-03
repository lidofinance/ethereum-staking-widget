import { FC, PropsWithChildren } from 'react';
import { ThemeProvider, themeDark, Text } from '@lidofinance/lido-ui';

import { SelectIconTooltipWrapper, SelectIconTooltipContent } from './styles';

type SelectIconTooltipProps = {
  showArrow: boolean;
};

export const SelectIconTooltip: FC<
  PropsWithChildren<SelectIconTooltipProps>
> = ({ children, showArrow }) => {
  return (
    <SelectIconTooltipWrapper>
      <SelectIconTooltipContent $showArrow={showArrow}>
        <ThemeProvider theme={themeDark}>
          <Text size={'xs'}>{children}</Text>
        </ThemeProvider>
      </SelectIconTooltipContent>
    </SelectIconTooltipWrapper>
  );
};
