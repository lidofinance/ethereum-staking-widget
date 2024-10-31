import React from 'react';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';
import { useDappStatus, DAPP_CHAIN_TYPE } from 'modules/web3';

import { EthereumFAQ } from './ethereum-faq/faq';
import { OptimismFAQ } from './optimism-faq/faq';

export const faqComponentsMap = new Map([
  [DAPP_CHAIN_TYPE.Ethereum, EthereumFAQ],
  [DAPP_CHAIN_TYPE.Optimism, OptimismFAQ],
  // FAQ for other networks
]);

export const WrapFaq = () => {
  const { isWalletConnected, chainType } = useDappStatus();
  const onClickHandler = useMatomoEventHandle();

  const faqComponent = !isWalletConnected
    ? EthereumFAQ
    : faqComponentsMap.get(chainType) || EthereumFAQ;

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      {React.createElement(faqComponent, { key: chainType })}
    </Section>
  );
};
