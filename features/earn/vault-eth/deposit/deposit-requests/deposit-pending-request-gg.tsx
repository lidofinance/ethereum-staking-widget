import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';
import { useGgvUsd } from 'features/earn/vault-ggv';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestGg = (props: Props) => {
  const { data: ggvData, isLoading: isGgvLoading } = useGgvUsd(
    props.request.assets,
  );
  return (
    <EthVaultDepositPendingRequest
      {...props}
      usdAmount={ggvData?.usd}
      isLoading={props.isLoading || isGgvLoading}
    />
  );
};
