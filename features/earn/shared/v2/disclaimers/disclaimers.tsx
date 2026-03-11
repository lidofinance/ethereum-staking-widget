import { DisclaimerSection } from 'shared/components/disclaimer-section/disclaimer-section';
import { LegalDisclaimer } from 'shared/components/legal-disclaimer/legal-disclaimer';
import { AprDisclaimer } from 'shared/components/apr-disclaimer/apr-disclaimer';
import { DisclaimersContainerStyled } from './styles';

export const Disclaimers = () => {
  return (
    <DisclaimersContainerStyled>
      <DisclaimerSection>
        <AprDisclaimer mentionAPY />
        <LegalDisclaimer />
      </DisclaimerSection>
    </DisclaimersContainerStyled>
  );
};
