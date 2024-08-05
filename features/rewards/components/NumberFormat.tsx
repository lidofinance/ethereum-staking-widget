import {
  formatWEI,
  formatETH,
  formatStEthEth,
  formatCurrency,
  formatPercentage,
} from 'features/rewards/utils/numberFormatting';
import { Tooltip, Box, InlineLoader } from '@lidofinance/lido-ui';
import type { BigNumber } from 'features/rewards/helpers';
import { Big, BigDecimal } from 'features/rewards/helpers';

// TODO: move to separate folders

type FormatArgs = {
  number?: string | number | BigNumber | undefined;
  StEthEth?: boolean;
  currency?: boolean;
  percent?: boolean;
  ETH?: boolean;
};

// Using ETH as a default formatter
const format = (
  { number, StEthEth, currency, percent, ETH }: FormatArgs,
  manyDigits?: boolean,
): string => {
  if (number === undefined) return '';

  const args = [new BigDecimal(number), Boolean(manyDigits)] as const;

  if (StEthEth) {
    return formatStEthEth(...args);
  } else if (currency) {
    return formatCurrency(...args);
  } else if (percent) {
    return formatPercentage(...args);
  } else if (ETH) {
    return formatETH(...args);
  } else {
    return formatWEI(new Big(number), args[1]);
  }
};

type Props = Partial<FormatArgs> & {
  id?: string;
  pending?: boolean;
};

const NumberFormat = (props: Props) => {
  if (props.pending)
    return (
      <InlineLoader
        style={{ flexBasis: '60%', minWidth: '60px', manWidth: '120px' }}
      />
    );

  return props.number ? (
    <Tooltip
      placement="bottom"
      title={
        <Box padding="12px!important">
          <span id={props.id} className="number full">
            {format(props, true)}
          </span>
        </Box>
      }
    >
      <span id={props.id} className="number short">
        {format(props)}
      </span>
    </Tooltip>
  ) : (
    <>-</>
  );
};

export default NumberFormat;
