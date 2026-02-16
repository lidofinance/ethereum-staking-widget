import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestWstETH = (props: Props) => {
  const { request } = props;
  const { usdAmount, isLoading: isUsdLoading } = useWstethUsd(request.assets);

  return (
    <EthVaultDepositPendingRequest
      {...props}
      usdAmount={usdAmount ?? 0}
      isLoading={props.isLoading || isUsdLoading}
    />
  );
};
