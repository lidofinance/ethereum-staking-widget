import React from 'react';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';
import { useDappStatus } from 'modules/web3';
import { DAPP_CHAIN_TYPE } from 'modules/web3/consts/chains';

import { EthereumFAQ } from './ethereum-faq/faq';
import { OptimismFAQ } from './optimism-faq/faq';
import { SoneiumFAQ } from './soneium-faq/faq';
import { UnichainFAQ } from './unichain-faq/faq';

export const faqComponentsMap = new Map([
  [DAPP_CHAIN_TYPE.Ethereum, EthereumFAQ],
  [DAPP_CHAIN_TYPE.Optimism, OptimismFAQ],
  [DAPP_CHAIN_TYPE.Soneium, SoneiumFAQ],
  [DAPP_CHAIN_TYPE.Unichain, UnichainFAQ],
]);

export const WrapFaq = () => {
  const { isWalletConnected, chainType } = useDappStatus();
  const onClickHandler = useMatomoEventHandle();

  const FAQ = !isWalletConnected
    ? EthereumFAQ
    : faqComponentsMap.get(chainType) || EthereumFAQ;

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <FAQ />
    </Section>
  );
};
