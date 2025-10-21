import { useEthUsd } from 'shared/hooks/use-eth-usd';
import {
  STGDepositPendingRequest,
  STGDepositPendingRequestProps,
} from './stg-deposit-pending-request';

type Props = Omit<STGDepositPendingRequestProps, 'usdAmount'>;

export const STGDepositPendingRequestETH = (props: Props) => {
  const { request } = props;
  const { usdAmount, isLoading: isUsdLoading } = useEthUsd(request.assets);

  return (
    <STGDepositPendingRequest
      {...props}
      usdAmount={usdAmount ?? 0}
      isLoading={props.isLoading || isUsdLoading}
    />
  );
};
