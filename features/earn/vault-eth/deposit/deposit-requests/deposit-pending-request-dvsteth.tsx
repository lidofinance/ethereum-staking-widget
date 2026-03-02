import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestDvsteth = (props: Props) => {
  // TODO: usd conversion for dvstETH
  return (
    <EthVaultDepositPendingRequest {...props} isLoading={props.isLoading} />
  );
};
