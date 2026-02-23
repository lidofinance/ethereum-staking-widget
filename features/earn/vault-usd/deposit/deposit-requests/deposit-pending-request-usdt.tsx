import { useUsdcUsd } from 'shared/hooks/use-usdc-usd';
import {
  UsdVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const UsdVaultDepositPendingRequestUSDT = (props: Props) => {
  const { request } = props;
  const { usdAmount } = useUsdcUsd(request.assets);

  return (
    <UsdVaultDepositPendingRequest
      {...props}
      usdAmount={usdAmount ?? 0}
      isLoading={props.isLoading}
    />
  );
};
