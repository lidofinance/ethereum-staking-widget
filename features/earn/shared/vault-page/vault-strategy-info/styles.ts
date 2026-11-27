import styled from 'styled-components';
import { DataList, TextLink } from '@lidofinance/lido-app-ui';

export const InfoList = styled(DataList)`
  && {
    gap: var(--lido-app-ui-space-12);
  }
`;

export const InfoBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-16);
`;

export const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--lido-app-ui-space-8) var(--lido-app-ui-space-24);
`;

export const PartnerValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--lido-app-ui-space-4);

  & > svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
`;

// a partner name is a link in the default text colour, as in the design
export const PartnerLink = styled(TextLink)`
  && {
    color: var(--lido-app-ui-color-text-default);
  }

  &&:hover {
    color: var(--lido-app-ui-color-text-active);
  }
`;
