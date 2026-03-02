import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestStreth = (props: Props) => {
  // TODO: usd conversion for streth
  return (
    <EthVaultDepositPendingRequest {...props} isLoading={props.isLoading} />
  );
};
