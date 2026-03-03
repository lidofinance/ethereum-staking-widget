import { useDvvUsd } from 'features/earn/vault-dvv';
import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestDvsteth = (props: Props) => {
  const { data, isLoading } = useDvvUsd(props.request.assets);
  return (
    <EthVaultDepositPendingRequest
      {...props}
      usdAmount={data?.usd}
      isLoading={props.isLoading || isLoading}
    />
  );
};
