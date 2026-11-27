import {
  Mellow,
  Nethermind,
  Skeleton,
  TextLink,
} from '@lidofinance/lido-app-ui';

import { config } from 'config';
import { DATA_UNAVAILABLE } from 'consts/text';
import {
  ACTIVE_FEES_TOOLTIP,
  WITHDRAWAL_WAITING_TIME_TOOLTIP,
} from 'modules/mellow-meta-vaults';
import type { ActiveFees } from 'modules/mellow-meta-vaults/utils/format-fee-d6';

import {
  StrategyInfoPartner,
  type StrategyInfoRow,
} from './vault-strategy-info';

const MELLOW_URL = 'https://mellow.finance/';
const NETHERMIND_AUDIT_URL =
  'https://2485622279-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FPyujKH9RYkVLASDhGflO%2Fuploads%2F3TMwsLt6Q2z3Wutyewuo%2FNM_0758_Mellow-1.pdf?alt=media&token=187ae9c0-f4fd-44b0-bfd8-d5b003bcd94b';
const MELLOW_TERMS_URL =
  'https://mellow.finance/Runtime-Labs-Vault-Legal-Notice.pdf';
const MELLOW_PRIVACY_URL = 'https://mellow.finance/Mellow-Privacy-Notice.pdf';

export const METAVAULT_ALLOCATION_TOOLTIP =
  'Data is provided by Mellow’s API and reflects the most recent snapshot at the time of update. As a result, the TVL shown here may differ from the vault’s TVL due to the data timestamp';

const FeeValue = ({
  value,
  isLoading,
}: {
  value?: string;
  isLoading?: boolean;
}) =>
  isLoading ? (
    <Skeleton variant="text" width="3em" />
  ) : (
    <>{value ?? DATA_UNAVAILABLE}</>
  );

type MetavaultStrategyRowsParams = {
  fees?: ActiveFees;
  isFeesLoading?: boolean;
};

// Mellow metavaults (EarnETH, EarnUSD) share the curator, the audit and the fee model
export const getMetavaultStrategyRows = ({
  fees,
  isFeesLoading,
}: MetavaultStrategyRowsParams): StrategyInfoRow[] => [
  {
    label: 'Curator',
    value: (
      <StrategyInfoPartner icon={<Mellow />} name="Mellow" href={MELLOW_URL} />
    ),
  },
  { label: 'Vault contract deployed', value: '02 Feb 2026' },
  {
    label: 'Audit',
    value: (
      <StrategyInfoPartner
        icon={<Nethermind />}
        name="Nethermind"
        href={NETHERMIND_AUDIT_URL}
      />
    ),
  },
  { label: 'Last audit date', value: '02 March 2026' },
  {
    label: 'Withdrawal wait time',
    value: 'Instant or up to 72 hours',
    info: WITHDRAWAL_WAITING_TIME_TOOLTIP,
  },
  {
    label: 'Performance fee',
    value: <FeeValue value={fees?.performanceFee} isLoading={isFeesLoading} />,
    info: ACTIVE_FEES_TOOLTIP,
  },
  {
    label: 'Platform fee',
    value: <FeeValue value={fees?.platformFee} isLoading={isFeesLoading} />,
  },
];

const InlineLink = ({ href, children }: { href: string; children: string }) => (
  <TextLink href={href} size="inherit">
    {children}
  </TextLink>
);

type MetavaultRiskDisclosureProps = {
  // e.g. 'EarnETH'
  vaultTitle: string;
  // e.g. 'ETH-based'
  returnsLabel: string;
};

export const MetavaultRiskDisclosure = ({
  vaultTitle,
  returnsLabel,
}: MetavaultRiskDisclosureProps) => (
  <>
    <p>
      The {vaultTitle} vault is designed to optimize {returnsLabel} returns by
      allocating capital across a diversified selection of DeFi protocols and
      strategies within the broader ecosystem.
      <br />
      The vault provides exposure to multiple DeFi positions, each carrying
      smart contract risk and different levels of market and economic risk. Its
      strategies include liquidity provision, which may lead to impermanent
      loss, and the use of leverage, introducing potential liquidation risk.
      Please note that the vault is not available to U.S. persons, U.S.
      residents, or individuals located in other restricted jurisdictions.{' '}
      <InlineLink href={`${config.rootOrigin}/earn/risk-disclosures`}>
        See this for further disclosures
      </InlineLink>
      .
    </p>
    <p>
      <br />
      Lido {vaultTitle} relies on third-party infrastructure provided by Mellow.
      By proceeding, you are subject to Mellow&apos;s{' '}
      <InlineLink href={MELLOW_TERMS_URL}>Terms of Service</InlineLink> and{' '}
      <InlineLink href={MELLOW_PRIVACY_URL}>Privacy Notice</InlineLink>.
      <br />
      <br />
      By depositing cryptoassets into the Lido {vaultTitle} vault you:
    </p>
    <ul>
      <li>
        Acknowledge and accept Mellow&apos;s{' '}
        <InlineLink href={MELLOW_TERMS_URL}>Terms of Use</InlineLink> and{' '}
        <InlineLink href={MELLOW_PRIVACY_URL}>Privacy Notice</InlineLink>,{' '}
        <InlineLink href={`${config.rootOrigin}/terms-of-use`}>
          Lido&apos;s Terms of Use
        </InlineLink>{' '}
        and the{' '}
        <InlineLink href={`${config.rootOrigin}/earn/risk-disclosures`}>
          Risk Disclosures
        </InlineLink>
        .
      </li>
      <li>
        Acknowledge and agree that the Lido {vaultTitle} vault relies on
        third-party infrastructure provided by Mellow (&quot;Third-Party
        Services&quot;) and that : (a) the operation, performance, security,
        legality, or continued availability of any such Third-Party Services
        cannot be guaranteed; (b) any integration, routing, or utilisation of
        cryptoassets through such Third-Party Services may result in partial or
        total loss, inaccessibility, or impairment of cryptoassets, whether due
        to malfunction, insolvency, security breach, exploit, hack, de-peg, or
        other technical or operational failure; and (&zwnj;c) you assume all
        such risks fully and voluntarily. By using or interacting with the
        vault, you acknowledge that the blockchain and DeFi ecosystems are
        experimental and inherently risky, and you accept and assume all risks
        associated with the use of any Third-Party Services, integrations, or
        protocols, entirely at your own discretion and responsibility.
      </li>
    </ul>
  </>
);
