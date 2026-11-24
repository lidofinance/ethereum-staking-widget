import styled from 'styled-components';
import { LiquidControls } from './animated-card';
import { Stats } from './stats';
import { Staking } from './staking';

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

export const V2 = () => {
  return (
    <TemporaryV2Layout>
      <Stats />
      <Staking />
      {/* tuning panel for the card background, dev server only */}
      {process.env.NODE_ENV === 'development' && <LiquidControls />}
    </TemporaryV2Layout>
  );
};
