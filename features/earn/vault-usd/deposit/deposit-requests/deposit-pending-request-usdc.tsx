import { useEthUsd } from 'shared/hooks/use-eth-usd';
import {
  UsdVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const UsdVaultDepositPendingRequestUSDC = (props: Props) => {
  const { request } = props;
  const { usdAmount, isLoading: isUsdLoading } = useEthUsd(request.assets);

  return (
    <UsdVaultDepositPendingRequest
      {...props}
      usdAmount={usdAmount ?? 0}
      isLoading={props.isLoading || isUsdLoading}
    />
  );
};
