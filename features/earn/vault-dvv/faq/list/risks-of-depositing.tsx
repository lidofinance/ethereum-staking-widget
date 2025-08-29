import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { useInpageNavigation } from 'providers/inpage-navigation';
import { OnlyInfraRender } from 'shared/components/only-infra-render';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const RisksOfDepositing: FC = () => {
  const { navigateInpageAnchor } = useInpageNavigation();
  const OTHER_RISKS_PATH = `#lidoStakingRisks`;
  const OTHER_RISKS_LINK_TEXT = `Other inherited Lido protocol risks`;

  return (
    <AccordionNavigatable
      summary="What are the risks of depositing DVV?"
      id="risks-of-depositing"
    >
      <p>
        As with any DeFi products, there are risks. Please note this list is not
        exhaustive:
      </p>
      <ul>
        <li>Smart contract risk</li>
        <li>Validator slashing risk</li>
        <li>
          <OnlyInfraRender renderIPFS={OTHER_RISKS_LINK_TEXT}>
            <Link
              href={OTHER_RISKS_PATH}
              target="_self"
              onClick={(e) => {
                navigateInpageAnchor(e);
              }}
            >
              {OTHER_RISKS_LINK_TEXT}
            </Link>
          </OnlyInfraRender>
        </li>
      </ul>
      <p>
        <i>
          Always conduct your own research and consult your own professional
          advisors to understand all potential risks before participating.
        </i>
      </p>
    </AccordionNavigatable>
  );
};
