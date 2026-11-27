import type { ReactNode } from 'react';

import { WhatIsEarnEthAnswer } from 'features/earn/vault-eth/faq/list/what-is-earneth';
import { WhatIsApyForEarnEthAnswer } from 'features/earn/vault-eth/faq/list/what-is-apy-for-earneth';
import { WhatFeesAreAppliedAnswer } from 'features/earn/vault-eth/faq/list/what-fees-are-applied';
import { RisksOfDepositingAnswer } from 'features/earn/vault-eth/faq/list/risks-of-depositing';
import { WhatIsEarnUsdAnswer } from 'features/earn/vault-usd/faq/list/what-is-earnusd';
import { HowDoesDepositWorkAnswer } from 'features/earn/vault-usd/faq/list/how-does-deposit-work';
import { HowDoesWithdrawalWorkAnswer } from 'features/earn/vault-usd/faq/list/how-does-withdrawal-work';
import { WhatIsApyForEarnUsdAnswer } from 'features/earn/vault-usd/faq/list/what-is-apy-for-earnusd';

type FaqEntry = {
  id: string;
  question: string;
  answer: ReactNode;
};

export const EARN_LIST_FAQ: FaqEntry[] = [
  {
    id: 'how-does-lido-earn-work',
    question: 'How does Lido Earn work?',
    answer: (
      <p>
        Lido Earn gives you access to on-chain rewards through two DeFi vaults.
        EarnETH deploys ETH and stETH. EarnUSD deploys USD stablecoins. Each
        vault has its own strategy, reward profile and risks.
      </p>
    ),
  },
  {
    id: 'what-is-earneth',
    question: 'What is EarnETH, and how does it work?',
    answer: <WhatIsEarnEthAnswer />,
  },
  {
    id: 'earneth-apy',
    question: 'How is EarnETH APY calculated?',
    answer: <WhatIsApyForEarnEthAnswer />,
  },
  {
    id: 'earneth-fees',
    question: 'What fees apply to EarnETH?',
    answer: <WhatFeesAreAppliedAnswer />,
  },
  {
    id: 'earneth-risks',
    question: 'What are the risks of EarnETH?',
    answer: <RisksOfDepositingAnswer />,
  },
  {
    id: 'what-is-earnusd',
    question: 'What is EarnUSD?',
    answer: <WhatIsEarnUsdAnswer />,
  },
  {
    id: 'earnusd-tokens',
    question: 'Which tokens can I deposit into EarnUSD?',
    answer: <HowDoesDepositWorkAnswer />,
  },
  {
    id: 'earnusd-withdrawals',
    question: 'How do EarnUSD withdrawals work?',
    answer: <HowDoesWithdrawalWorkAnswer />,
  },
  {
    id: 'earnusd-apy',
    question: 'How is EarnUSD APY calculated?',
    answer: <WhatIsApyForEarnUsdAnswer />,
  },
];
