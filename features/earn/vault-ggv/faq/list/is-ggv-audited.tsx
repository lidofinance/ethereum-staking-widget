import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

const BORING_VAULT_URL =
  'https://docs.veda.tech/architecture-and-flow-of-funds/boringvault';
const MACRO_URL = 'https://0xmacro.com/';
const SPEARBIT_URL = 'https://cantina.xyz/solutions/spearbit';
const AUDITS_URL = 'https://github.com/Veda-Labs/boring-vault/tree/main/audit';

export const IsGGVAudited: FC = () => {
  return (
    <AccordionNavigatable summary="Is GGV audited?" id="is-ggv-audited">
      <span>
        The GGV vault is built on{' '}
        <Link href={BORING_VAULT_URL}>Veda&apos;s BoringVault code</Link>, which
        is the most widely used vault code in DeFi. Veda has commissioned audits
        by <Link href={MACRO_URL}>0xMacro</Link> and{' '}
        <Link href={SPEARBIT_URL}>Spearbit</Link>, which can be found{' '}
        <Link href={AUDITS_URL}>here</Link>.
      </span>
    </AccordionNavigatable>
  );
};
