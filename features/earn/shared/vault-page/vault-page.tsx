import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useInpageNavigation } from 'providers/inpage-navigation';

import { EarnInfoBanner } from '../earn-info-banner';
import { LossProtectionBanner } from '../loss-protection-banner';
import { EarnDisclaimers } from '../disclaimers';
import { VaultPerformance } from '../vault-chart';
import { MetavaultAllocation } from '../metavault-allocation';
import type { VaultVisualVariant } from '../vault-visual';

import { VaultHero } from './vault-hero';
import {
  VaultStrategyInfo,
  type StrategyInfoLink,
  type StrategyInfoRow,
} from './vault-strategy-info';
import { VaultRiskDisclosure } from './vault-risk-disclosure';
import { VaultCtaBar } from './vault-cta-bar';
import { VaultFaq } from './vault-faq';
import type { VaultApx, VaultChartMatomo, VaultName, VaultTvl } from './types';
import {
  CardsStack,
  MainColumn,
  PageColumns,
  PageRoot,
  SideColumn,
} from './styles';

// in-page anchors of the cards that replaced the old tabs
const SECTION_IDS = {
  performance: 'performance',
  strategy: 'strategy',
} as const;

const SECTION_ID_SET = new Set<string>(Object.values(SECTION_IDS));

type VaultPageProps = {
  vaultName: VaultName;
  variant: VaultVisualVariant;
  title: string;
  description: string;
  illustration: ReactNode;
  protectedBadgeTooltip?: ReactNode;
  apx: VaultApx;
  tvl: VaultTvl;
  sidePanel: ReactNode;
  strategyInfo: { rows: StrategyInfoRow[]; links: StrategyInfoLink[] };
  riskDisclosure: ReactNode;
  allocationTooltip?: ReactNode;
  faqContent: ReactNode;
  chartMatomo?: VaultChartMatomo;
};

export const VaultPage = ({
  vaultName,
  variant,
  title,
  description,
  illustration,
  protectedBadgeTooltip,
  apx,
  tvl,
  sidePanel,
  strategyInfo,
  riskDisclosure,
  allocationTooltip,
  faqContent,
  chartMatomo,
}: VaultPageProps) => {
  const { hashNav } = useInpageNavigation();
  const sideRef = useRef<HTMLDivElement>(null);
  // the floating bar shows only while the side panel is out of view
  const [isSidePanelInView, setIsSidePanelInView] = useState(true);

  useEffect(() => {
    const node = sideRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsSidePanelInView(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // links to the old tabs ('#performance', '#strategy') now scroll to the cards
  useEffect(() => {
    if (!hashNav || !SECTION_ID_SET.has(hashNav)) return;
    document.getElementById(hashNav)?.scrollIntoView({ behavior: 'smooth' });
  }, [hashNav]);

  const scrollToSidePanel = useCallback(() => {
    sideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const isCtaBarVisible = !isSidePanelInView;

  return (
    <PageRoot data-testid="vault-page">
      <PageColumns>
        <MainColumn>
          <VaultHero
            title={title}
            description={description}
            variant={variant}
            illustration={illustration}
            protectedBadgeTooltip={protectedBadgeTooltip}
            apx={apx}
            tvl={tvl}
          />
          <CardsStack>
            <LossProtectionBanner />
            <EarnInfoBanner />
            <VaultPerformance
              vaultName={vaultName}
              id={SECTION_IDS.performance}
              matomo={chartMatomo}
            />
            <MetavaultAllocation
              vaultName={vaultName}
              id={SECTION_IDS.strategy}
              updatedTooltip={allocationTooltip}
            />
            <VaultStrategyInfo
              rows={strategyInfo.rows}
              links={strategyInfo.links}
            />
            <VaultRiskDisclosure>{riskDisclosure}</VaultRiskDisclosure>
          </CardsStack>
        </MainColumn>
        <SideColumn ref={sideRef}>{sidePanel}</SideColumn>
      </PageColumns>

      <EarnDisclaimers />

      <VaultCtaBar
        title={title}
        apx={apx.value}
        isApxLoading={apx.isLoading}
        visible={isCtaBarVisible}
        onDepositClick={scrollToSidePanel}
      />
      <VaultFaq raised={isCtaBarVisible}>{faqContent}</VaultFaq>
    </PageRoot>
  );
};
