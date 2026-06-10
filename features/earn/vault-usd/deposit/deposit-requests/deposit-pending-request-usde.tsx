import { useUsdeToUsd } from 'shared/hooks/use-usde-to-usd';
import {
  UsdVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const UsdVaultDepositPendingRequestUSDE = (props: Props) => {
  const { request } = props;
  const { usdAmount } = useUsdeToUsd(request.assets);

  return (
    <UsdVaultDepositPendingRequest
      {...props}
      usdAmount={usdAmount}
      isLoading={props.isLoading}
    />
  );
};
