import type { ReactNode } from 'react';
import styled from 'styled-components';
import { CloseButton, Typography, downQuery } from '@lidofinance/lido-app-ui';

import { EarnCard } from '../earn-card';

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--lido-app-ui-space-20);
  box-sizing: border-box;
  width: 100%;
  padding: var(--lido-app-ui-space-16) var(--lido-app-ui-space-20)
    var(--lido-app-ui-space-16) var(--lido-app-ui-space-32);

  @media ${downQuery('sm')} {
    padding: var(--lido-app-ui-space-20);
  }
`;

const Main = styled.div`
  display: flex;
  flex: 1 1 0;
  align-items: center;
  gap: var(--lido-app-ui-space-20);
  min-width: 0;
`;

const Illustration = styled.span`
  display: flex;
  flex: none;

  & > svg {
    display: block;
  }
`;

const Text = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--lido-app-ui-space-8);
`;

// The title line is 28px and the icon is 24px: keep the icon on the first line.
const TitleIcon = styled.span`
  display: flex;
  flex: none;
  margin-top: 2px;

  & > svg {
    display: block;
    width: 24px;
    height: 24px;
  }
`;

type EarnNotificationProps = {
  title?: ReactNode;
  titleIcon?: ReactNode;
  illustration?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  'data-testid'?: string;
};

// The "Notification" block of the Earn design: lido-app-ui has no component with an illustration slot.
export const EarnNotification = ({
  title,
  titleIcon,
  illustration,
  children,
  onClose,
  'data-testid': dataTestId,
}: EarnNotificationProps) => (
  <EarnCard padding={0} gap={0} data-testid={dataTestId}>
    <Row>
      <Main>
        {illustration && (
          <Illustration aria-hidden="true">{illustration}</Illustration>
        )}
        <Text>
          {(title || titleIcon) && (
            <Header>
              {titleIcon && (
                <TitleIcon aria-hidden="true">{titleIcon}</TitleIcon>
              )}
              {title && (
                <Typography as="h2" variant="bodyLarge" weight="semibold">
                  {title}
                </Typography>
              )}
            </Header>
          )}
          <Typography as="div" variant="description" color="secondary">
            {children}
          </Typography>
        </Text>
      </Main>
      <CloseButton onClick={onClose} />
    </Row>
  </EarnCard>
);
