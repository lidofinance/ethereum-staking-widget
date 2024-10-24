import { Component } from 'types';
import { useWalletModal } from '../wallet-modal/use-wallet-modal';
import { AddressBadge } from '../components/address-badge/address-badge';
import {
  WalletCardStyle,
  WalletCardRowStyle,
  WalletCardBalanceStyle,
  WalletCardTitleStyle,
  WalletCardValueStyle,
  WalletCardExtraStyle,
  WalletCardAccountStyle,
  WalletCardContentStyle,
  InlineLoaderStyled,
} from './styles';
import {
  WalletCardBalanceComponent,
  WalletCardComponent,
  WalletCardRowComponent,
} from './types';
import { useDappStatus } from 'modules/web3';

export const Card: WalletCardComponent = (props) => {
  return <WalletCardStyle color="accent" {...props} />;
};

export const CardRow: WalletCardRowComponent = (props) => {
  return <WalletCardRowStyle {...props} />;
};

export const CardBalance: WalletCardBalanceComponent = (props) => {
  const {
    title,
    small = false,
    extra,
    loading = false,
    children,
    value,
    ...rest
  } = props;

  const hasExtra = !!extra;
  const hasChildren = !!children;

  return (
    <WalletCardBalanceStyle {...rest}>
      <WalletCardTitleStyle>{title}</WalletCardTitleStyle>
      <WalletCardValueStyle $small={small}>
        {loading ? <InlineLoaderStyled /> : value}
      </WalletCardValueStyle>
      {hasExtra && (
        <WalletCardExtraStyle>
          {loading ? <InlineLoaderStyled /> : extra}
        </WalletCardExtraStyle>
      )}
      {hasChildren && (
        <WalletCardContentStyle $hidden={loading}>
          {children}
        </WalletCardContentStyle>
      )}
    </WalletCardBalanceStyle>
  );
};

export const CardAccount: Component<'div'> = (props) => {
  const { address } = useDappStatus();
  const { openModal } = useWalletModal();

  return (
    <WalletCardAccountStyle {...props}>
      <AddressBadge
        data-testid="accountSectionCard"
        address={address}
        onClick={() => openModal({})}
        color="accent"
      />
    </WalletCardAccountStyle>
  );
};
