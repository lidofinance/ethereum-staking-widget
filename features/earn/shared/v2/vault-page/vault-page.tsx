import type { ComponentType, FC, SVGProps } from 'react';

import { RightColumn } from './right-column';
import { LeftColumn } from './left-column';
import {
  ActionTabs,
  ActionTab,
  Description,
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
  TableLink,
  TableDivider,
  TableValue,
} from './styles';

type VaultIllustration = ComponentType<SVGProps<SVGSVGElement>>;

type Props = {
  title: string;
  description: string;
  apy: string;
  tvl: string;
  upgradeAmount: string;
  logo: VaultIllustration;
};

export const VaultPage: FC<Props> = (props) => {
  return (
    <Layout>
      <LeftColumn {...props}>
        <ActionTabs>
          <ActionTab $active>Performance</ActionTab>
          <ActionTab>Strategy</ActionTab>
          <ActionTab>FAQ</ActionTab>
        </ActionTabs>
        <Metrics>
          <InfoRow>
            <InfoRowLabel>7D APY</InfoRowLabel>
            <InfoRowValue>8.4%</InfoRowValue>
          </InfoRow>
          <InfoRow>
            <InfoRowLabel>30D APY</InfoRowLabel>
            <InfoRowValue>7.65%</InfoRowValue>
          </InfoRow>
          <InfoRow>
            <InfoRowLabel>Performance fee</InfoRowLabel>
            <InfoRowValue>10%</InfoRowValue>
          </InfoRow>
          <InfoRow>
            <InfoRowLabel>Platform fee</InfoRowLabel>
            <InfoRowValue>1%</InfoRowValue>
          </InfoRow>
        </Metrics>
        <Section>
          <SectionTitle>General Information</SectionTitle>
          <Table>
            <TableGroup>
              <TableItem>
                <TableLabel>Curator</TableLabel>
                <TableValue>● Mellow</TableValue>
              </TableItem>
              <TableItem>
                <TableLabel>Sub-vault curators</TableLabel>
                <TableValue>● AAVE · ● Morpho · ● Uniswap</TableValue>
              </TableItem>
            </TableGroup>
            <TableGroup>
              <TableItem>
                <TableLabel>Audit</TableLabel>
                <TableValue>● Certora</TableValue>
              </TableItem>
              <TableItem>
                <TableLabel>Last audit date</TableLabel>
                <TableValue>10 Sep 2025</TableValue>
              </TableItem>
              <TableItem>
                <TableLabel>Deposit wait time</TableLabel>
                <TableValue>24 hours</TableValue>
              </TableItem>
              <TableItem>
                <TableLabel>Withdrawal wait time</TableLabel>
                <TableValue>up to 72 hours</TableValue>
              </TableItem>
            </TableGroup>
          </Table>
          <TableDivider />
          <Table>
            <TableGroup>
              <TableItem>
                <TableLabel>Vault contract deployed</TableLabel>
                <TableValue>19 Sep 2025</TableValue>
              </TableItem>
              <TableItem>
                <TableLabel>Last transaction</TableLabel>
                <TableValue>2025-12-16 16:31:23</TableValue>
              </TableItem>
            </TableGroup>
            <TableGroup>
              <TableItem>
                <TableLabel>View on Etherscan</TableLabel>
                <TableValue>
                  <TableLink
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      // TODO: link to Etherscan
                    }}
                  >
                    View on Etherscan
                  </TableLink>
                </TableValue>
              </TableItem>
              <TableItem>
                <TableLabel>View on Debank</TableLabel>
                <TableValue>
                  <TableLink
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      // TODO: link to Debank
                    }}
                  >
                    View on Debank
                  </TableLink>
                </TableValue>
              </TableItem>
            </TableGroup>
          </Table>
        </Section>
        <RiskSection>
          <SectionTitle>Risk Disclosures</SectionTitle>
          <Description>
            Lorem ipsum dolor sit amet consectetur. Iaculis nascetur turpis
            vitae sit vestibulum ultrices enim nisi pellentesque. Cras egestas
            consectetur quis in fermentum. Nisi est lorem vel fringilla vel
            mattis fusce aliquet semper. Facilisis elit at ac odio lorem
            volutpat sed. Imperdiet pulvinar porta nunc elit non hendrerit
            adipiscing fermentum pellentesque. Sollicitudin nec porttitor diam
            non. Arcu amet et porttitor quis mattis nam erat. Interdum quis
            egestas at nisl viverra eget lorem.
          </Description>
        </RiskSection>
      </LeftColumn>
      <RightColumn />
    </Layout>
  );
};
