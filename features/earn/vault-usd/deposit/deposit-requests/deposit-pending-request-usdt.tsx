import { useUsdtToUsd } from 'shared/hooks/use-usdt-to-usd';
import {
  UsdVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const UsdVaultDepositPendingRequestUSDT = (props: Props) => {
  const { request } = props;
  const { usdAmount } = useUsdtToUsd(request.assets);

  return (
    <UsdVaultDepositPendingRequest
      {...props}
      usdAmount={usdAmount}
      isLoading={props.isLoading}
    />
  );
};
