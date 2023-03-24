import { FC } from 'react';
import { useWeb3 } from '@reef-knot/web3-react';
import { Button } from '@lidofinance/lido-ui';

import { Connect } from 'shared/wallet';
import { useRequestData, useWithdrawals } from 'features/withdrawals/hooks';

import { ButtonLinkWrap } from './styles';

type FormButtonProps = {
  pending: boolean;
  disabled?: boolean;
};

const linkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

export const FormButton: FC<FormButtonProps> = (props) => {
  const { pending, disabled } = props;

  const { active } = useWeb3();
  const { isSteth } = useWithdrawals();
  const { isLidoRequest, currentRequestType } = useRequestData();

  if (!active) return <Connect fullwidth />;

  const buttonTitle = isLidoRequest
    ? 'Request withdrawal'
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
    <Button
      fullwidth
      type="submit"
      disabled={(isLidoRequest && disabled) || pending}
      loading={pending}
    >
      {buttonTitle}
    </Button>
  );
};
