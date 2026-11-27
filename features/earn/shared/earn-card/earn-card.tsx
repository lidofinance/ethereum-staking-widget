import type { ComponentProps, ReactNode } from 'react';
import styled from 'styled-components';
import { Card, Typography } from '@lidofinance/lido-app-ui';

// TODO: update when fixed in lido-app-ui
// The design uses radius xl (32px) for the page cards; the library Card has lg (20px).
export const EarnCard = styled(Card)`
  && {
    border-radius: var(--lido-app-ui-border-radius-xl);
  }
`;

type EarnCardTitleProps = Omit<ComponentProps<typeof Typography>, 'variant'> & {
  children: ReactNode;
};

export const EarnCardTitle = ({ children, ...rest }: EarnCardTitleProps) => (
  <Typography as="h2" variant="bodyLarge" weight="semibold" {...rest}>
    {children}
  </Typography>
);
