import type { ReactNode } from 'react';
import styled from 'styled-components';

import { EarnCard, EarnCardTitle } from '../earn-card';

// the disclosure is long legal text in the description size
const DisclosureText = styled.div`
  font-size: var(--lido-app-ui-font-size-tooltip);
  line-height: var(--lido-app-ui-line-height-description);
  letter-spacing: var(--lido-app-ui-letter-spacing-tooltip);
  color: var(--lido-app-ui-color-text-secondary);

  p,
  ul {
    margin: 0;
  }

  // the paragraphs keep the blank lines of the design; only the list has a gap
  ul {
    margin-top: var(--lido-app-ui-space-8);
    padding-left: var(--lido-app-ui-space-20);
  }
`;

export const VaultRiskDisclosure = ({ children }: { children: ReactNode }) => (
  <EarnCard align="stretch" gap={32} data-testid="risk-disclosure">
    <EarnCardTitle>Risk Disclosure</EarnCardTitle>
    <DisclosureText>{children}</DisclosureText>
  </EarnCard>
);
