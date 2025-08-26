import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { useInpageNavigation } from 'providers/inpage-navigation';

export const RisksOfDepositing: FC = () => {
  const { navigateInpageAnchor } = useInpageNavigation();
  const OTHER_RISKS_PATH = `#lidoStakingRisks`;

  return (
    <Accordion summary="What are the risks of depositing DVV?">
      <p>
        As with any DeFi products, there are risks. Please note this list is not
        exhaustive:
      </p>
      <ul>
        <li>Smart contract risk</li>
        <li>Validator slashing risk</li>
        <li>
          <Link
            href={OTHER_RISKS_PATH}
            target="_self"
            onClick={(e) => {
              navigateInpageAnchor(e);
            }}
          >
            Other inherited Lido protocol risks
          </Link>
        </li>
      </ul>
      <p>
        <i>
          Always conduct your own research and consult your own professional
          advisors to understand all potential risks before participating.
        </i>
      </p>
    </Accordion>
  );
};
