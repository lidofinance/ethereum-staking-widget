import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const HiddenBlock = styled.div.attrs({ 'aria-hidden': 'true' })`
  display: none;
`;

export const Hidden = ({
  show,
  children,
}: PropsWithChildren<{ show: boolean }>) =>
  show ? <>{children}</> : <HiddenBlock>{children}</HiddenBlock>;
