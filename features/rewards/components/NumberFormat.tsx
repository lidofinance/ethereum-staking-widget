import { Tooltip, Box, InlineLoader } from '@lidofinance/lido-ui';
import {
  formatWEI,
  formatETH,
  formatCurrency,
  formatStEthEth,
  formatPercentage,
} from 'features/rewards/utils/numberFormatting';

type FormatArgs = {
  number?: string | number | undefined;
  StEthEth?: boolean;
  currency?: boolean;
  percent?: boolean;
  ETH?: boolean;
};

// Using ETH as a default formatter
const format = (props: FormatArgs, manyDigits?: boolean): string => {
  const { number, StEthEth, currency, percent, ETH } = props;
  if (number === undefined) return '';

  const numberString = typeof number === 'string' ? number : number.toString();

  if (numberString === '0') return numberString;

  if (StEthEth) {
    return formatStEthEth(numberString, manyDigits);
  } else if (currency) {
    return formatCurrency(numberString, manyDigits);
  } else if (percent) {
    return formatPercentage(numberString, manyDigits);
  } else if (ETH) {
    return formatETH(numberString, manyDigits);
  } else {
    return formatWEI(numberString, manyDigits);
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
        style={{ flexBasis: '60%', minWidth: '60px', maxWidth: '120px' }}
      />
    );

  return props.number != null ? (
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
