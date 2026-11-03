import { FC } from 'react';
import type { Address } from 'viem';

import { TokenStethIcon, TokenWstethIcon } from 'assets/earn';
import {
  IconSparkles,
  TokenEthIcon,
  TokenWethIcon,
  TokenUsdcIcon,
  TokenUsdeIcon,
  TokenUsdtIcon,
} from 'assets/earn-v2';
import { useConfig } from 'config/use-config';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { useDappStatus } from 'modules/web3';
import { LocalLink } from 'shared/components/local-link';
import { FormatPercent, FormatPrice, FormatToken } from 'shared/formatters';

import { useEarnGeoGate } from '../shared/hooks/use-earn-geo-gate';
import { VaultTip } from '../shared/vault-tip';
import {
  SMART_SUGGEST_APY_HINT,
  SMART_SUGGEST_DEPOSIT_PATHS,
  type SmartSuggestToken,
} from './consts';
import { useSmartSuggestData } from './hooks/use-smart-suggest-data';
import { useSmartSuggestOpen } from './hooks/use-smart-suggest-open';
import type { SmartSuggestRow } from './utils/calculate-suggestions';
import {
  ActionCell,
  ApyCell,
  Collapse,
  CollapseInner,
  Content,
  DepositButton,
  Divider,
  Header,
  Row,
  Rows,
  SmartSuggestBlock,
  Title,
  ToggleButton,
  TokenCell,
  TotalInline,
  TotalLarge,
  TotalRow,
  YieldCell,
} from './styles';

const TOKEN_ICONS: Record<SmartSuggestToken, JSX.Element> = {
  eth: <TokenEthIcon />,
  weth: <TokenWethIcon />,
  steth: <TokenStethIcon />,
  wsteth: <TokenWstethIcon />,
  usdc: <TokenUsdcIcon />,
  usdt: <TokenUsdtIcon />,
  usde: <TokenUsdeIcon />,
};

type SmartSuggestRowItemProps = {
  row: SmartSuggestRow;
};

const SmartSuggestRowItem: FC<SmartSuggestRowItemProps> = ({ row }) => (
  <Row data-testid={`smart-suggest-row-${row.token}`}>
    <TokenCell>
      {TOKEN_ICONS[row.token]}
      <FormatToken
        amount={row.balance}
        decimals={row.decimals}
        symbol={TOKEN_SYMBOLS[row.token]}
      />
    </TokenCell>
    <ApyCell>
      <FormatPercent value={row.apy} decimals="percent" /> APY
    </ApyCell>
    <YieldCell>
      <FormatToken
        amount={row.yearlyYield}
        decimals={row.yieldDecimals}
        symbol={TOKEN_SYMBOLS[row.yieldToken]}
      />{' '}
      / year
    </YieldCell>
    <ActionCell>
      <LocalLink
        href={SMART_SUGGEST_DEPOSIT_PATHS[row.vault]}
        query={{ token: row.token }}
      >
        <DepositButton
          size="xs"
          variant="translucent"
          data-testid="smart-suggest-deposit"
        >
          Deposit
        </DepositButton>
      </LocalLink>
    </ActionCell>
  </Row>
);

type SmartSuggestViewProps = {
  rows: SmartSuggestRow[];
  totalUsd: number;
  isOpen: boolean;
  onToggle: () => void;
};

export const SmartSuggestView: FC<SmartSuggestViewProps> = ({
  rows,
  totalUsd,
  isOpen,
  onToggle,
}) => {
  const total = <FormatPrice amount={totalUsd} maximumFractionDigits={0} />;

  return (
    <SmartSuggestBlock data-testid="smart-suggest">
      <Header>
        <IconSparkles aria-hidden />
        <Title>Your potential yield</Title>
        {!isOpen && <TotalInline>{total}</TotalInline>}
        <ToggleButton
          $variant="small"
          $isOpen={isOpen}
          aria-expanded={isOpen}
          onClick={onToggle}
          data-testid="smart-suggest-toggle"
        >
          {isOpen ? 'Hide' : 'Show'}
        </ToggleButton>
      </Header>
      <Collapse $isOpen={isOpen}>
        <CollapseInner>
          <Content>
            <TotalRow>
              <TotalLarge data-testid="smart-suggest-total">{total}</TotalLarge>
              <VaultTip>{SMART_SUGGEST_APY_HINT}</VaultTip>
            </TotalRow>
            <Divider />
            <Rows>
              {rows.map((row) => (
                <SmartSuggestRowItem key={row.token} row={row} />
              ))}
            </Rows>
          </Content>
        </CollapseInner>
      </Collapse>
    </SmartSuggestBlock>
  );
};

type SmartSuggestContentProps = {
  address: Address;
};

const SmartSuggestContent: FC<SmartSuggestContentProps> = ({ address }) => {
  const { isReady, rows, totalUsd } = useSmartSuggestData();
  const [isOpen, setIsOpen] = useSmartSuggestOpen(address);

  // Show nothing while loading. The block fades in when the data is ready.
  if (!isReady || rows.length === 0) return null;

  return (
    <SmartSuggestView
      rows={rows}
      totalUsd={totalUsd}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    />
  );
};

export const SmartSuggest: FC = () => {
  const { featureFlags } = useConfig().externalConfig;
  const { isDappActive, address } = useDappStatus();
  const { isDepositGeoAvailable } = useEarnGeoGate();

  if (
    featureFlags.earnSmartSuggestEnabled !== true ||
    !isDappActive ||
    !address ||
    !isDepositGeoAvailable
  ) {
    return null;
  }

  return <SmartSuggestContent address={address} />;
};
