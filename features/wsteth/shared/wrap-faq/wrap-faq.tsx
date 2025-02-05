import React from 'react';

import { CHAINS } from 'consts/chains';
import { useDappStatus } from 'modules/web3';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

import { EthereumFAQ } from './ethereum-faq/faq';
import { OptimismFAQ } from './optimism-faq/faq';
import { SoneiumFAQ } from './soneium-faq/faq';

export const faqComponentsMap = new Map([
  [CHAINS.Mainnet, EthereumFAQ],
  [CHAINS.Sepolia, EthereumFAQ],
  [CHAINS.Holesky, EthereumFAQ],
  [CHAINS.Optimism, OptimismFAQ],
  [CHAINS.OptimismSepolia, OptimismFAQ],
  [CHAINS.Soneium, SoneiumFAQ],
  [CHAINS.SoneiumMinato, SoneiumFAQ],
]);

export const WrapFaq = () => {
  const { isWalletConnected, chainId } = useDappStatus();
  const onClickHandler = useMatomoEventHandle();

  const FAQ = !isWalletConnected
    ? EthereumFAQ
    : faqComponentsMap.get(chainId) || EthereumFAQ;

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <FAQ />
    </Section>
  );
};
