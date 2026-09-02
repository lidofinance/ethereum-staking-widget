import {
  useState,
  useEffect,
  useCallback,
  type ComponentType,
  type FC,
  type ReactNode,
  type SVGProps,
} from 'react';
import { Tab, Tooltip, Question } from '@lidofinance/lido-ui';

import { type MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { useInpageNavigation } from 'providers/inpage-navigation';

import { VaultChart } from '../vault-chart';

import type { VaultBalanceProp } from './content/top-section';
import { SidePanel } from './side-panel';
import { VaultPageContent } from './content';
import { TopSection } from './content/top-section';
import {
  InfoRow,
  InfoRowLabel,
  InfoRowValue,
  Layout,
  LeftColumn,
  Metrics,
  RiskSection,
  Section,
  SectionTitle,
  Table,
  TableGroup,
  TableItem,
  TableLabel,
  TableValue,
  Description,
  TabsStyled,
} from './styles';

type VaultIllustration = ComponentType<SVGProps<SVGSVGElement>>;

export type InfoItem = {
  label: ReactNode;
  value?: ReactNode;
  tooltip?: ReactNode;
};

type Props = {
  title: string;
  description: string;
  apx?: number | null;
  apxLabel?: string;
  apxHint?: React.ReactNode;
  apxUpdateTooltipText?: React.ReactNode;
  isApxStale?: boolean;
  isApxLoading?: boolean;
  tvlUsd?: number | null;
  isTvlLoading?: boolean;
  logo: VaultIllustration;
  sidePanel?: ReactNode;
  vaultName: 'ethVault' | 'usdVault';
  fees: InfoItem[];
  generalInfoLeft: InfoItem[];
  generalInfoRight: InfoItem[];
  riskDisclosure: ReactNode;
  strategyContent?: ReactNode;
  faqContent?: ReactNode;
  balance?: VaultBalanceProp;
  matomo?: {
    performanceTabEvent?: MATOMO_EVENT_TYPE;
    strategyTabEvent?: MATOMO_EVENT_TYPE;
    faqTabEvent?: MATOMO_EVENT_TYPE;
    clickChartsTvlTab?: MATOMO_EVENT_TYPE;
    clickChartsTvl1m?: MATOMO_EVENT_TYPE;
    clickChartsTvl3m?: MATOMO_EVENT_TYPE;
    clickChartsApyTab?: MATOMO_EVENT_TYPE;
    clickChartsApy1m?: MATOMO_EVENT_TYPE;
    clickChartsApy3m?: MATOMO_EVENT_TYPE;
  };
  protectedBadgeTooltipText?: React.ReactNode;
};

const TABS = {
  PERFORMANCE: 'performance',
  STRATEGY: 'strategy',
  FAQ: 'faq',
} as const;

export const VaultPage: FC<Props> = (props) => {
  const {
    fees,
    generalInfoLeft,
    generalInfoRight,
    riskDisclosure,
    strategyContent,
    faqContent,
    protectedBadgeTooltipText,
  } = props;
  const { performanceTabEvent, strategyTabEvent, faqTabEvent } =
    props.matomo ?? {};

  const { hashNav, resetInpageAnchor } = useInpageNavigation();

  const [activeTab, setActiveTab] = useState<(typeof TABS)[keyof typeof TABS]>(
    TABS.PERFORMANCE,
  );

  useEffect(() => {
    if (!hashNav) return;
    if (hashNav === TABS.STRATEGY) setActiveTab(TABS.STRATEGY);
    else if (hashNav === TABS.PERFORMANCE) setActiveTab(TABS.PERFORMANCE);
    else setActiveTab(TABS.FAQ); // handles #faq and any FAQ item hash
  }, [hashNav]);

  const handleTabClick = useCallback(
    (tab: (typeof TABS)[keyof typeof TABS], matomoEvent?: MATOMO_EVENT_TYPE) =>
      () => {
        setActiveTab(tab);
        resetInpageAnchor();
        if (matomoEvent) trackMatomoEvent(matomoEvent);
      },
    [resetInpageAnchor],
  );

  return (
    <Layout>
      <LeftColumn>
        <TopSection
          logo={props.logo}
          title={props.title}
          description={props.description}
          apx={props.apx}
          apxLabel={props.apxLabel}
          tvlUsd={props.tvlUsd}
          apxHint={props.apxHint}
          apxUpdateTooltipText={props.apxUpdateTooltipText}
          isApxStale={props.isApxStale}
          isApxLoading={props.isApxLoading}
          isTvlLoading={props.isTvlLoading}
          protectedBadgeTooltipText={protectedBadgeTooltipText}
          balance={props.balance}
        />
        <VaultPageContent>
          <TabsStyled>
            <Tab
              active={activeTab === TABS.PERFORMANCE}
              onClick={handleTabClick(TABS.PERFORMANCE, performanceTabEvent)}
              data-testid="performance-tab"
            >
              Performance
            </Tab>
            <Tab
              active={activeTab === TABS.STRATEGY}
              onClick={handleTabClick(TABS.STRATEGY, strategyTabEvent)}
              data-testid="strategy-tab"
            >
              Strategy
            </Tab>
            <Tab
              active={activeTab === TABS.FAQ}
              onClick={handleTabClick(TABS.FAQ, faqTabEvent)}
              data-testid="faq-tab"
            >
              FAQ
            </Tab>
          </TabsStyled>

          {activeTab === TABS.PERFORMANCE && (
            <>
              <VaultChart vaultName={props.vaultName} matomo={props.matomo} />
              <Metrics>
                {fees.map((fee, index) => (
                  <InfoRow key={index} data-testid="fee">
                    <InfoRowLabel>{fee.label}</InfoRowLabel>
                    {fee.value != null && (
                      <InfoRowValue>{fee.value}</InfoRowValue>
                    )}
                  </InfoRow>
                ))}
              </Metrics>
              <Section data-testid="general-info">
                <SectionTitle data-testid="general-info-title">
                  General Information
                </SectionTitle>
                <Table data-testid="general-info-table">
                  <TableGroup>
                    {generalInfoLeft.map((item, index) => (
                      <TableItem key={index} data-testid="table-item">
                        <TableLabel>
                          {item.label}
                          {item.tooltip && (
                            <Tooltip title={item.tooltip}>
                              <Question />
                            </Tooltip>
                          )}
                        </TableLabel>
                        {item.value != null && (
                          <TableValue>{item.value}</TableValue>
                        )}
                      </TableItem>
                    ))}
                  </TableGroup>
                  <TableGroup>
                    {generalInfoRight.map((item, index) => (
                      <TableItem key={index} data-testid="table-item">
                        <TableLabel>
                          {item.label}
                          {item.tooltip && (
                            <Tooltip title={item.tooltip}>
                              <Question />
                            </Tooltip>
                          )}
                        </TableLabel>
                        {item.value != null && (
                          <TableValue>{item.value}</TableValue>
                        )}
                      </TableItem>
                    ))}
                  </TableGroup>
                </Table>
              </Section>
              <RiskSection data-testid="risk-disclosure">
                <SectionTitle>Risk Disclosures</SectionTitle>
                <Description>{riskDisclosure}</Description>
              </RiskSection>
            </>
          )}

          {activeTab === TABS.STRATEGY && strategyContent}
          {activeTab === TABS.FAQ && faqContent}
        </VaultPageContent>
      </LeftColumn>
      <SidePanel>{props.sidePanel}</SidePanel>
    </Layout>
  );
};
