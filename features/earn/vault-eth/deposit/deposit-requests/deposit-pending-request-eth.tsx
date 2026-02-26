import { useEthUsd } from 'shared/hooks/use-eth-usd';
import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestETH = (props: Props) => {
  const { request } = props;
  const { usdAmount, isLoading: isUsdLoading } = useEthUsd(request.assets);

  return (
    <EthVaultDepositPendingRequest
      {...props}
      usdAmount={usdAmount}
      isLoading={props.isLoading || isUsdLoading}
    />
  );
};
