import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import {
  STGDepositPendingRequest,
  STGDepositPendingRequestProps,
} from './stg-deposit-pending-request';

type Props = Omit<STGDepositPendingRequestProps, 'usdAmount'>;

export const STGDepositPendingRequestWstETH = (props: Props) => {
  const { request } = props;
  const { usdAmount, isLoading: isUsdLoading } = useWstethUsd(request.assets);

  return (
    <STGDepositPendingRequest
      {...props}
      usdAmount={usdAmount ?? 0}
      isLoading={props.isLoading || isUsdLoading}
    />
  );
};
