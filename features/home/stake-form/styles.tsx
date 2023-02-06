import React from 'react';

import styled from 'styled-components';
import { Input, Button } from '@lidofinance/lido-ui';

export const InputStyled = styled((props) => <Input {...props} />)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const MaxButton = styled(
  (props: React.ComponentProps<typeof Button>) => <Button {...props} />,
)`
  letter-spacing: 0.4px;
`;
