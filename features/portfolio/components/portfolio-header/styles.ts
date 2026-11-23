import styled from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

const AVATAR_SIZE = 78;
const AVATAR_SIZE_MOBILE = 56;

export const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-24);

  @media ${downQuery('sm')} {
    gap: var(--lido-app-ui-space-16);
  }
`;

export const Avatar = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  overflow: hidden;
  border-radius: 50%;
  background: var(--lido-app-ui-color-background-secondary);

  @media ${downQuery('sm')} {
    width: ${AVATAR_SIZE_MOBILE}px;
    height: ${AVATAR_SIZE_MOBILE}px;
  }

  > * {
    width: 100%;
    height: 100%;
  }
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-8);
  min-width: 0;

  > h2 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
