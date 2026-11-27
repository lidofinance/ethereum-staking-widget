import styled from 'styled-components';

import { AprDisclaimer, LegalDisclaimer } from 'shared/components';

const DisclaimersRoot = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-16);
  width: 100%;
  margin: var(--lido-app-ui-space-52) 0 var(--lido-app-ui-space-32);
  font-size: var(--lido-app-ui-font-size-tooltip);
  line-height: var(--lido-app-ui-line-height-description);
  letter-spacing: var(--lido-app-ui-letter-spacing-tooltip);
  color: var(--lido-app-ui-color-text-tertiary);

  p {
    margin: 0;
  }

  // the APR text puts a <br> between its paragraphs
  br {
    display: block;
    content: '';
    margin-top: var(--lido-app-ui-space-16);
  }

  a,
  a:visited {
    color: var(--lido-app-ui-color-text-active);
  }
`;

// APY and legal notes under the Earn pages
export const EarnDisclaimers = ({ className }: { className?: string }) => (
  <DisclaimersRoot className={className}>
    <AprDisclaimer mentionAPY />
    <LegalDisclaimer />
  </DisclaimersRoot>
);
