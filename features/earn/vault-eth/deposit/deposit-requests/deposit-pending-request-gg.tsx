import {
  EthVaultDepositPendingRequest,
  DepositPendingRequestProps,
} from './deposit-pending-request';

type Props = Omit<DepositPendingRequestProps, 'usdAmount'>;

export const EthVaultDepositPendingRequestGg = (props: Props) => {
  // TODO: usd conversion for GG
  return (
    <EthVaultDepositPendingRequest {...props} isLoading={props.isLoading} />
  );
};
