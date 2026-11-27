import styled from 'styled-components';

import { LiquidControls } from './animated-card';
import { Stats } from './stats';
import { Staking } from './staking';
import { StakePathProvider, type StakePath } from './routing';

// Should be proper lido-app-ui layout/pageContent components
const TemporaryV2Layout = styled.div`
  display: flex;
  gap: 32px;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 520px;
  width: 100%;
`;

type V2Props = {
  path: StakePath;
};

export const StakeV2 = ({ path }: V2Props) => {
  return (
    <StakePathProvider path={path}>
      <TemporaryV2Layout>
        <Stats />
        <Staking />
        {/* tuning panel for the card background, on stands too */}
        <LiquidControls />
      </TemporaryV2Layout>
    </StakePathProvider>
  );
};
