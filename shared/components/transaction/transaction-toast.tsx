import { Link } from '@lidofinance/lido-ui';
import { getEtherscanTxLink } from '@lido-sdk/helpers';
import { TransactionDescriptionStyle, TransactionTitleStyle } from './styles';
import {
  TransactionToastComponent,
  TransactionToastEtherscanComponent,
} from './types';

export const TransactionToast: TransactionToastComponent = (props) => {
  const { title, children } = props;

  return (
    <>
      <TransactionTitleStyle>{title}</TransactionTitleStyle>
      <TransactionDescriptionStyle>{children}</TransactionDescriptionStyle>
    </>
  );
};

export const TransactionToastEtherscan: TransactionToastEtherscanComponent = (
  props,
) => {
  const { chainId, hash, children, ...rest } = props;
  // TODO: move from lido-js-sdk or better type getEtherscanTxLink
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const etherscanLink = getEtherscanTxLink(chainId as any, hash);

  return (
    <TransactionToast {...rest}>
      {children && <div>{children}</div>}
      <Link href={etherscanLink}>View on Etherscan</Link>
    </TransactionToast>
  );
};
