import React from 'react';

import { LegalParagraph } from './styles';

type VaultLegalProps = {
  legalDisclosure?: React.ReactNode;
  allocation?: React.ReactNode;
};

const DEFAULT_LEGAL_DISCLOSURE = (
  <>
    Note, that the vault involves protocol, slashing and other risks. You can
    find more details in the FAQ below.
  </>
);

export const VaultLegal = ({
  legalDisclosure = DEFAULT_LEGAL_DISCLOSURE,
  allocation,
}: VaultLegalProps) => {
  return (
    <>
      {legalDisclosure && (
        <LegalParagraph data-testid="vault-legal">
          {legalDisclosure}
        </LegalParagraph>
      )}
      {allocation && (
        <LegalParagraph data-testid="vault-allocation">
          <b>Allocation: </b>
          {allocation}
        </LegalParagraph>
      )}
    </>
  );
};
