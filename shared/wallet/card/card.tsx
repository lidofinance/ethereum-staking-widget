import { InlineLoader } from '@lidofinance/lido-ui';
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
} from './styles';
import {
  WalletCardBalanceComponent,
  WalletCardComponent,
  WalletCardRowComponent,
} from './types';

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
        {loading ? <InlineLoader /> : value}
      </WalletCardValueStyle>
      {hasExtra && (
        <WalletCardExtraStyle>
          {loading ? <InlineLoader /> : extra}
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

export const CardAccount: Component<'div', { account?: string | null }> = (
  props,
) => {
  const { account, ...rest } = props;
  const { openModal } = useWalletModal();

  return (
    <WalletCardAccountStyle {...rest}>
      <AddressBadge
        data-testid="accountSectionCard"
        address={account}
        onClick={() => openModal({})}
        color="accent"
      />
    </WalletCardAccountStyle>
  );
};
