import { FC } from 'react';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Button } from '@lidofinance/lido-ui';

import { Connect } from 'shared/wallet';
import { useRequestData, useWithdrawals } from 'features/withdrawals/hooks';

import { ButtonLinkWrap } from './styles';

type FormButtonProps = {
  pending: boolean;
  disabled?: boolean;
  isLocked?: boolean;
};

const linkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

export const FormButton: FC<FormButtonProps> = ({
  pending,
  disabled,
  isLocked,
}) => {
  const { active } = useWeb3();
  const { isSteth, isPaused } = useWithdrawals();
  const { isLidoRequest, currentRequestType } = useRequestData();

  if (!active) return <Connect fullwidth />;

  const buttonTitle = isLidoRequest
    ? isLocked
      ? 'Unlock tokens for withdrawal'
      : 'Request withdrawal'
    : `Go to ${currentRequestType?.name}`;

  if (!isLidoRequest)
    return (
      <ButtonLinkWrap
        {...{
          ...linkProps,
          href: isSteth
            ? currentRequestType?.stethUrl
            : currentRequestType?.wstethUrl,
        }}
      >
        <Button fullwidth>{buttonTitle}</Button>
      </ButtonLinkWrap>
    );

  return (
    <ButtonIcon
      fullwidth
      icon={isLocked ? <Lock /> : <></>}
      type="submit"
      disabled={(isLidoRequest && disabled) || pending || isPaused}
      loading={pending}
    >
      {buttonTitle}
    </ButtonIcon>
  );
};
