import { FC } from 'react';

import { RequestEthAmountStyled, RequestStyled } from './styles';

type RequestProps = {
  title: string;
};

export const Request: FC<RequestProps> = (props) => {
  const { title, children } = props;

  return (
    <RequestStyled>
      <div>{title}</div>
      <RequestEthAmountStyled>{children}</RequestEthAmountStyled>
    </RequestStyled>
  );
};
