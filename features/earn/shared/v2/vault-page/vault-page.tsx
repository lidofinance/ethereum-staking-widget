import {
  useState,
  type ComponentType,
  type FC,
  type ReactNode,
  type SVGProps,
} from 'react';
import { Tab } from '@lidofinance/lido-ui';

import { type MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { VaultChart } from '../vault-chart';

import { SidePanel } from './side-panel';
import { VaultPageContent } from './content';
import { TopSection } from './content/top-section';
import {
  InfoRow,
  InfoRowLabel,
  InfoRowValue,
  Layout,
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
};

type Props = {
  title: string;
  description: string;
  apx?: number | null;
  tvl?: number | null;
  apxHint?: React.ReactNode;
  isApxLoading?: boolean;
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
  } = props;
  const { performanceTabEvent, strategyTabEvent, faqTabEvent } =
    props.matomo ?? {};

  const [activeTab, setActiveTab] = useState<(typeof TABS)[keyof typeof TABS]>(
    TABS.PERFORMANCE,
  );

  return (
    <Layout>
      <TopSection
        logo={props.logo}
        title={props.title}
        description={props.description}
        apx={props.apx}
        tvl={props.tvl}
        apxHint={props.apxHint}
        isApxLoading={props.isApxLoading}
        isTvlLoading={props.isTvlLoading}
      />
      <VaultPageContent>
        <TabsStyled>
          <Tab
            active={activeTab === TABS.PERFORMANCE}
            onClick={() => {
              setActiveTab(TABS.PERFORMANCE);
              if (performanceTabEvent) trackMatomoEvent(performanceTabEvent);
            }}
          >
            Performance
          </Tab>
          <Tab
            active={activeTab === TABS.STRATEGY}
            onClick={() => {
              setActiveTab(TABS.STRATEGY);
              if (strategyTabEvent) trackMatomoEvent(strategyTabEvent);
            }}
          >
            Strategy
          </Tab>
          <Tab
            active={activeTab === TABS.FAQ}
            onClick={() => {
              setActiveTab(TABS.FAQ);
              if (faqTabEvent) trackMatomoEvent(faqTabEvent);
            }}
          >
            FAQ
          </Tab>
        </TabsStyled>

        {activeTab === TABS.PERFORMANCE && (
          <>
            <VaultChart vaultName={props.vaultName} matomo={props.matomo} />
            <Metrics>
              {fees.map((fee, index) => (
                <InfoRow key={index}>
                  <InfoRowLabel>{fee.label}</InfoRowLabel>
                  {fee.value != null && (
                    <InfoRowValue>{fee.value}</InfoRowValue>
                  )}
                </InfoRow>
              ))}
            </Metrics>
            <Section>
              <SectionTitle>General Information</SectionTitle>
              <Table>
                <TableGroup>
                  {generalInfoLeft.map((item, index) => (
                    <TableItem key={index}>
                      <TableLabel>{item.label}</TableLabel>
                      {item.value != null && (
                        <TableValue>{item.value}</TableValue>
                      )}
                    </TableItem>
                  ))}
                </TableGroup>
                <TableGroup>
                  {generalInfoRight.map((item, index) => (
                    <TableItem key={index}>
                      <TableLabel>{item.label}</TableLabel>
                      {item.value != null && (
                        <TableValue>{item.value}</TableValue>
                      )}
                    </TableItem>
                  ))}
                </TableGroup>
              </Table>
            </Section>
            <RiskSection>
              <SectionTitle>Risk Disclosures</SectionTitle>
              <Description>{riskDisclosure}</Description>
            </RiskSection>
          </>
        )}

        {activeTab === TABS.STRATEGY && strategyContent}
        {activeTab === TABS.FAQ && faqContent}
      </VaultPageContent>
      <SidePanel>{props.sidePanel}</SidePanel>
    </Layout>
  );
};
