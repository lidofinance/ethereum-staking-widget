import { FC } from 'react';
import { Button } from '@lidofinance/lido-ui';

import { QA_KEYS } from 'consts/qa-keys';
import { Drawer } from 'shared/components/drawer';

import { ConfigSnapshot } from './config-snapshot';
import { ExternalConfigSection } from './external-config-section';
import { FeatureFlagsSection } from './feature-flags-section';
import { QaMocksSection } from './qa-mocks-section';

type QaDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const resetAllMocks = () => {
  for (const key of Object.values(QA_KEYS)) {
    localStorage.removeItem(key);
  }
  window.location.reload();
};

const QaDrawer: FC<QaDrawerProps> = ({ isOpen, onClose }) => (
  <Drawer
    isOpen={isOpen}
    onClose={onClose}
    title="QA debug"
    data-testid="qa-debug-drawer"
    footer={
      <>
        <Button fullwidth onClick={() => window.location.reload()}>
          Apply & reload
        </Button>
        <Button fullwidth variant="outlined" onClick={resetAllMocks}>
          Reset all mocks & reload
        </Button>
      </>
    }
  >
    <FeatureFlagsSection />
    <QaMocksSection />
    <ExternalConfigSection />
    <ConfigSnapshot />
  </Drawer>
);

export default QaDrawer;
