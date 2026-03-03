import { useStgUsd } from 'features/earn/vault-stg';
import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestStreth = (props: Props) => {
  const { data, isLoading } = useStgUsd(props.request.assets);
  return (
    <EthVaultDepositPendingRequest
      {...props}
      usdAmount={data?.usd}
      isLoading={props.isLoading || isLoading}
    />
  );
};
